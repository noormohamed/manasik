import {Record} from "openai/core";

interface StripeInvoiceInterface {
    id: string;
    object: "invoice";
    account_country: string | null;
    account_name: string | null;
    account_tax_ids: string[] | null;
    amount_due: number;
    amount_overpaid: number;
    amount_paid: number;
    amount_remaining: number;
    amount_shipping: number;
    application: string | null;
    attempt_count: number;
    attempted: boolean;
    auto_advance: boolean;
    automatic_tax: {
        disabled_reason: string | null;
        enabled: boolean;
        liability: string | null;
        provider: string | null;
        status: string | null;
    };
    automatically_finalizes_at: number | null;
    billing_reason: string | null;
    collection_method: "charge_automatically" | "send_invoice" | null;
    created: number; // unix timestamp
    currency: string;
    custom_fields: any[] | null;
    customer: string | null;
    customer_address: any | null;
    customer_email: string | null;
    customer_name: string | null;
    customer_phone: string | null;
    customer_shipping: any | null;
    customer_tax_exempt: "none" | "exempt" | "reverse" | null;
    customer_tax_ids: any[];
    default_payment_method: string | null;
    default_source: string | null;
    default_tax_rates: any[];
    description: string | null;
    discounts: any[];
    due_date: number | null;
    effective_at: number | null;
    ending_balance: number | null;
    footer: string | null;
    from_invoice: any | null;
    hosted_invoice_url: string | null;
    invoice_pdf: string | null;
    issuer: {
        type: string;
    };
    last_finalization_error: any | null;
    latest_revision: string | null;
    lines: {
        object: "list";
        data: any[]; // expand later if needed
        has_more: boolean;
        total_count: number;
        url: string;
    };
    livemode: boolean;
    metadata: Record<string, string>;
    next_payment_attempt: number | null;
    number: string | null;
    on_behalf_of: string | null;
    parent: string | null;
    payment_settings: {
        default_mandate: string | null;
        payment_method_options: any | null;
        payment_method_types: string[] | null;
    };
    period_end: number;
    period_start: number;
    post_payment_credit_notes_amount: number;
    pre_payment_credit_notes_amount: number;
    receipt_number: string | null;
    rendering: {
        amount_tax_display: string | null;
        pdf: Record<string, any>;
        template: string | null;
        template_version: string | null;
    };
    shipping_cost: any | null;
    shipping_details: any | null;
    starting_balance: number;
    statement_descriptor: string | null;
    status: "draft" | "open" | "paid" | "uncollectible" | "void" | null;
    status_transitions: {
        finalized_at: number | null;
        marked_uncollectible_at: number | null;
        paid_at: number | null;
        voided_at: number | null;
    };
    subtotal: number;
    subtotal_excluding_tax: number;
    test_clock: string | null;
    total: number;
    total_discount_amounts: any[];
    total_excluding_tax: number;
    total_pretax_credit_amounts: any[];
    total_taxes: any[];
    webhooks_delivered_at: number | null;

    // Allow any extra properties Stripe may add in the future
    [key: string]: any;
}
