export default class StripeWebhook {

    baseURL: string = process.env.STRIPE_BASE_URL || "https://api.stripe.com/v1";
    secretKey: string = process.env.STRIPE_SECRET_KEY || "";
    data: any;

    constructor() {

    }

}
