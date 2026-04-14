import Mailgun from 'mailgun.js';
import FormData from 'form-data';
import { handler } from './handler';

export default class email {

    static async send(params: {
        to: string,
        from?: string,
        subject: string,
        template: string,
        data?: Record<string, any>
    }) {

        const mailgun = new Mailgun(FormData);
        const mg = mailgun.client({
            username: "api",
            key: process.env.MAILGUN_API_KEY!,
            url: "https://api.eu.mailgun.net"
        });

        // Load and apply template
        let html = handler.loadTemplate(params.template);

        if (params.data) {
            html = handler.apply(html, params.data);
        }

        try {
            const response = await mg.messages.create("mg.thejaminitiative.co.uk", {
                from: params.from || "JAM Initiative <postmaster@mg.thejaminitiative.co.uk>",
                to: 'Daniel <daniel@noormohamed.co.uk>',
                subject: params.subject,
                html: html,
            });

            console.log("Email sent:", response);
            return response;

        } catch (err) {
            console.error("Mailgun error:", err);
            throw err;
        }
    }
}