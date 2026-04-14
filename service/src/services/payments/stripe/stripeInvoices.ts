import StripeWebhook from "./stripeWebhook";
import {Elastic} from "../../elastic";
import {md5Hash} from "../../encrypt";

export interface InvoiceInterface {
    invNumber: string;
    status: string;
    subject: string;
    items: {
        name: string;
        price: number;
        quantity: number;
    }[];
}

export default class StripeInvoices extends StripeWebhook {

    data: InvoiceInterface;
    private elastic: Elastic;

    constructor(data: InvoiceInterface) {
        super();

        this.data = data;
        this.elastic = new Elastic();
    }

    async log(payload: any) {
        const id = md5Hash(payload).toString();
        this.elastic.post('log.payments', id, payload);
    }

    async findInvoice(invNumber: string) : Promise<InvoiceInterface> {

        if(!invNumber) {
            throw new Error('Invoice number is required');
        }

        let invoice = await this.elastic.get('invoices', invNumber);

        return {
            invNumber: "AB1",
            subject: "subject line",
            items: [{
                name: 'Subscription',
                price: 59.99,
                quantity: 3
            }],
            status: 'pending'
        };
    }

    async invoiceCreate() {
        await this.saveInvoice(this.data);
        return this.data;
    }

    async saveInvoice(data: InvoiceInterface) {

        console.log('InvoiceInterface', data);

        if(!data.invNumber) {
            throw new Error('Invoice number is required');
        }

        return this.elastic.post('invoices', data.invNumber, data);
    }

    async invoiceStatusChanged(invNumber: string, status: any) {
        const invoice = await this.findInvoice(invNumber);

        if(invoice.status === 'paid') {
            throw new Error('Invoice already paid');
        }
        invoice.status = status;
        await this.saveInvoice(invoice)

        return invoice;
    }

    async invoicePaid() {



        return this.invoicePaymentSucceeded();
    }

    async invoicePaymentFailed() {
        return await this.invoiceStatusChanged(this.data.invNumber, 'failed');
    }

    async invoicePaymentSucceeded() {
        return await this.invoiceStatusChanged(this.data.invNumber, 'paid');
    }

    async invoiceUpdated() {
        return await this.invoiceStatusChanged(this.data.invNumber, 'updated');
    }

    async invoiceVoided() {
        return await this.invoiceStatusChanged(this.data.invNumber, 'voided');
    }

    async invoiceSent() {
        return await this.invoiceStatusChanged(this.data.invNumber, 'sent');
    }

}