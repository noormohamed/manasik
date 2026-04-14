// src/services/freshworks/deals.ts
import dotenv from "dotenv";
import axios, { AxiosResponse } from "axios";

dotenv.config();

const API_KEY  = process.env.FRESHSALES_API_KEY!;
const DOMAIN   = process.env.FRESHSALES_DOMAIN!;
// NOTE: same style as your account.ts
const BASE_URL = `https://${DOMAIN}/crm/sales/api/deals`;

const headers = {
    "Content-Type": "application/json",
    Authorization: `Token token=${API_KEY}`,
};

export interface FreshsalesDeal {
    name: string;
    sales_account_id: number;          // attach to existing Account
    amount?: number;                   // major units (e.g., 123.45)
    currency?: string;                 // "GBP" | "USD" | ...
    deal_stage_id?: number;
    deal_type?: string;
    expected_close?: string;           // YYYY-MM-DD
    custom_field?: Record<string, any>;
    contacts_added_list?: number[];    // optional contact associations
    [key: string]: any;                // allow extras if needed
}

export async function fetchFields(): Promise<any> {
    try {
        const response: AxiosResponse<any> = await axios.get(
            `https://${DOMAIN}/crm/sales/api/settings/deals/fields`,
            { headers }
        );

        console.log(response);
        return response.data;
    } catch (error: any) {
        throw new Error(
            JSON.stringify(error.response?.data?.errors) ||
            error.message ||
            "Failed to add Freshsales deal"
        );
    }
}

export async function addFreshsalesDeal(deal: FreshsalesDeal): Promise<any> {
    try {
        const response: AxiosResponse<any> = await axios.post(
            BASE_URL,
            { deal },
            { headers }
        );

        return {
            data: response.data,
            fields: await fetchFields()
        };
    } catch (error: any) {
        throw new Error(
            JSON.stringify(error.response?.data?.errors) ||
            error.message ||
            "Failed to add Freshsales deal"
        );
    }
}
