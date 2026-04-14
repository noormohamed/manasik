// src/account.ts
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.FRESHSALES_API_KEY!;
const DOMAIN = process.env.FRESHSALES_DOMAIN!;
//const BASE_URL = `https://${DOMAIN}/api/accounts`;
const BASE_URL = `https://${DOMAIN}/crm/sales/api/sales_accounts`;

const BASE_URL_api = `https://${DOMAIN}/crm/sales`;
const BASE_API = BASE_URL_api + `/api`;

const headers = {
    'Content-Type': 'application/json',
    Authorization: `Token token=${API_KEY}`
};

export interface FreshsalesAccount {
    name: string;
    website?: string;
    industry?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    [key: string]: any;
}

export async function addFreshsalesAccount(account: FreshsalesAccount) {
    try {
        const response = await axios.post(
            BASE_URL,
            { sales_account: account },
            { headers }
        );
        return response.data;
    } catch (error: any) {
        throw new Error(
            JSON.stringify(error.response?.data.errors) || error.message || 'Failed to add account to Freshsales'
        );
    }
}

export async function listAllAccounts(viewID: number) {
    try {
        const response = await axios.get(
            `https://projectjam.myfreshworks.com/crm/sales/api/sales_accounts?include=lookup_information,owner&load_as_per_list_page_config=true&page=1&per_page=25&segment_id=202004418446&sort=updated_at&sort_type=desc`,
            { headers }
        );
        return response.data.sales_accounts ?? [];
    } catch (error: any) {
        throw new Error(
            error.response?.data?.message || error.message || 'Failed to search account by name'
        );
    }
}

export async function findAccountByDomain(domain: string) {

    const accounts = await listAllAccounts(202004418446);
    return accounts.find((acc: any) => {
        return acc.website === domain
    }) || null;
}

export async function findFreshsalesAccountByName(name: string) {
    try {
        const response = await axios.get(
            `${BASE_URL}/search`,
            {
                headers,
                params: {
                    q: `name is ${name}`
                }
            }
        );

        return response.data.accounts ?? [];
    } catch (error: any) {
        throw new Error(
            error.response?.data?.message || error.message || 'Failed to search account by name'
        );
    }
}

export async function assignContactToAccount(contactId: number, accountId: number) {
    try {
        const response = await axios.put(
            `https://${DOMAIN}/api/contacts/${contactId}`,
            {
                contact: {
                    account_id: accountId
                }
            },
            { headers }
        );
        return response.data;
    } catch (error: any) {
        throw new Error(
            error.response?.data?.message || error.message || 'Failed to assign contact to account'
        );
    }
}
