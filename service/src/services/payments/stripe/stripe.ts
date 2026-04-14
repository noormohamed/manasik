import axios from "axios";
import {Elastic} from "../../elastic";
import {logging} from "../../analytics/logging";
import {Cryptography} from "../../../utils/cryptography";
import { v4 as uuidv4 } from 'uuid';
import {Contact} from "../../../models/contact";
import {getCachedUsers} from "../../../models/userCache";
import {addFreshsalesDeal, FreshsalesDeal} from "../../freshworks/deals";
import {AccountCredits} from "../../../models/account";

export default class Stripe {
    private static baseURL: string = process.env.STRIPE_BASE_URL || "https://api.stripe.com/v1";
    private static secretKey: string = process.env.STRIPE_SECRET_KEY || "";

    private static headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Bearer ` + Stripe.secretKey
    };

    static async payments(companyId: string): Promise<object> {
        const e = new Elastic();
        const invoices = await e.fetch('stripe_invoice', {
            'invoice.company': companyId
        });

        const contacts = getCachedUsers();

        return invoices.map((v) => {
            const paid = v._source.paymentStatus
            let contact = contacts[v._source.invoice.user.toString()];

            if(v._source.invoice.reference == 'CreditPurchase') {
                v._source.invoice.reference = 'Credit Purchase';
            }

            if(!contact) {
                contact = {
                    first_name: 'Unknown',
                    last_name: 'Name',
                }
            }

            return {
                contact: {
                    first_name: contact.first_name,
                    last_name: contact.last_name
                },
                invoice: {...paid, ...v._source.invoice },
                timestamp: v._source.timestamp,
            };
        });
    }

    static async confirmPayment(ref: string, session_id: string, origin: string): Promise<any> {

       try {

           ref = ref.replace(/ /g, "+");
           const decryptHash = Cryptography.decrypt(ref);
           const detach = JSON.parse(decryptHash);


           const e = new Elastic();
           const payment = await e.get('stripe_payment_link', detach['md5']);
           const paymentLink = payment.body._source;

           const paymentStatus = await Stripe.checkPaymentStatus(session_id) as {
               id: string,
               amount_total: number,
               payment_status: string,
               payment_method_types: object
           };

           const invoiceReference = detach.invoice['metadata[reference]'];

           const invoiceData = {
               'stripe_payment_link': detach['md5'],
               'payment': {
                   'id': paymentLink.id,
                   'type': paymentLink.object,
                   'currency': paymentLink.currency
               },
               'paymentStatus': {
                   paymentId: paymentStatus.id,
                   amountTotal: paymentStatus.amount_total,
                   paymentStatus: paymentStatus.payment_status,
                   paymentMethod: paymentStatus.payment_method_types,
               },
               invoice: {
                   reference: invoiceReference,
                   currency: detach.invoice.currency,
                   item: detach.invoice['line_items[0][price_data][product_data][name]'],
                   units: detach.invoice['line_items[0][price_data][unit_amount]'],
                   user: detach.invoice['metadata[user]'],
                   company: detach.invoice['metadata[company]'],
               }
           };

           await e.post('stripe_invoice', detach['md5'], invoiceData);

           if (paymentStatus.payment_status === "paid") {

               const sales_account_id = Number(detach.invoice['metadata[company]']);
               const contactIdRaw = detach.invoice['metadata[user]'] ?? null;
               const contacts_added_list = [Number(contactIdRaw)];
               const amount = Math.round(paymentStatus.amount_total) / 100;

               const dealPayload: FreshsalesDeal = {
                   name: `Payment ${invoiceReference || paymentStatus.id} — ${invoiceData.invoice.item}`,
                   sales_account_id,
                   amount: amount,
                   currency: (invoiceData.payment.currency || "GBP").toUpperCase(),
                   deal_stage_id: 202000265146,
                   deal_type_id: '202000199225',
                   contacts_added_list,
                   custom_field: {
                       cf_payment_reference: invoiceReference,
                       cf_payment_source: "Stripe Checkout",
                       cf_payment_source_id: paymentStatus.id,
                   },
                   tags: ['Credit', 'Paid']
               };

               await addFreshsalesDeal(dealPayload);

               const c = new AccountCredits();
               await c.issueCredits(sales_account_id, invoiceData.invoice.units);
           }

           return origin + '/manager/billing?ref=' + detach['md5'];

       } catch (e) {
           console.log(e);
           return e;
       }
    }

    static async checkPaymentStatus(id: string) : Promise<object> {
        // /api/checkout-session
        const response = await axios.get(
            `https://api.stripe.com/v1/checkout/sessions/${id}`,
            { headers: Stripe.headers }
        );

        console.log('checkPaymentStatus', response.data)

        return response.data;
    }

    static async createPaymentLink(amount: number, reference: string, token: any) {
        try {


            const paymentRequest = {
                "line_items[0][price_data][currency]": "gbp",
                "line_items[0][price_data][product_data][name]": `Payment for ${reference}`,
                "line_items[0][price_data][unit_amount]": String(amount * 100), // amount in pence
                "line_items[0][quantity]": "1",

                "metadata[reference]": reference,
                "metadata[user]": token.id,
                "metadata[company]": token.accountId
            }

            function encryptTransaction(md5Hash?: string) {
                return Cryptography.encrypt(JSON.stringify({
                    md5: md5Hash || false,
                    userId: token.id,
                    location: token.location,
                    accounts: token.accountId,
                    invoice: paymentRequest,
                    uniqueID: uuidv4()
                }));
            }

            let encryptHash = encryptTransaction();

            const md5Hash = Cryptography.md5(encryptHash);

            encryptHash = encryptTransaction(md5Hash);

            const response = await axios.post(
                Stripe.baseURL + '/v1/payment_links', {
                    ...paymentRequest,
                    "after_completion[type]": "redirect",
                    "metadata[md5hash]": md5Hash,
                    "after_completion[redirect][url]": "http://localhost:3000/payment/link/success?md5="+ md5Hash + "&ref=" + encryptHash + '&session_id={CHECKOUT_SESSION_ID}',
                },
                { headers: Stripe.headers }
            );

            const e = new Elastic();
            const res = await e.post('stripe_payment_link', md5Hash, response.data);
            console.log('res', res);

            await logging({
                statusCode: 200,
                info: 55500,
                message: 'Successfully returned',
                source: response.data.id
            });

            return response.data.url;
        } catch (error: any) {

            await logging({
                statusCode: 200,
                info: 55500,
                message: 'Error Occurred',
                source: error.message
            });
            throw error;
        }
    }

    /*
     * Create an invoice on behalf of a customer (must create invoice items first).
     * Saves the invoice object into Elastic.
     */
    static async createInvoice(
        customerId: string,
        items: { price: string; quantity?: number }[],
        elasticIndex = "invoices"
    ) {
        // Create invoice items first
        for (const item of items) {
            await axios.post(
                `${Stripe.baseURL}/invoiceitems`,
                new URLSearchParams({
                    customer: customerId,
                    price: item.price,
                    quantity: String(item.quantity || 1),
                }),
                { headers: Stripe.headers }
            );
        }

        // Create the invoice
        const response = await axios.post(
            `${Stripe.baseURL}/invoices`,
            new URLSearchParams({
                customer: customerId,
                collection_method: "send_invoice",
                days_until_due: "7",
            }),
            { headers: Stripe.headers }
        );

        const invoice = response.data;

        // Save in Elastic
        const e = new Elastic();
        await e.post(elasticIndex, invoice.id, invoice);

        return invoice;
    }

    /*
     * Fetch an invoice from Stripe and update Elastic.
     */
    static async fetchInvoice(invoiceId: string, elasticIndex = "invoices") {
        const response = await axios.get(
            `${Stripe.baseURL}/invoices/${invoiceId}`,
            { headers: Stripe.headers }
        );

        const invoice = response.data;

        // Update Elastic
        const e = new Elastic();
        await e.post(elasticIndex, invoice.id, invoice);

        return invoice;
    }

    /*
     * Return the hosted_invoice_url for payment and update Elastic.
     */
    static async createInvoiceLink(invoiceId: string, elasticIndex = "invoices") {
        // Finalize invoice first
        await axios.post(
            `${Stripe.baseURL}/invoices/${invoiceId}/finalize`,
            null,
            { headers: Stripe.headers }
        );

        // Fetch updated invoice
        const response = await axios.get(
            `${Stripe.baseURL}/invoices/${invoiceId}`,
            { headers: Stripe.headers }
        );

        const invoice = response.data;
        const hostedUrl = invoice.hosted_invoice_url;

        // Save to Elastic
        const e = new Elastic();
        await e.post(elasticIndex, invoice.id, {
            ...invoice,
            hosted_invoice_url: hostedUrl,
        });

        return hostedUrl;
    }
}
