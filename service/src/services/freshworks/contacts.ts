import axios from 'axios';
import * as dotenv from 'dotenv';
import {FreshsalesContact} from "../../typing/contact";
import {Elastic} from "../elastic";
import {hashSHA256} from "../encrypt";
import jwt from 'jsonwebtoken';
import {checkLocalGeoIP} from "../../utils/ip";

dotenv.config();

const API_KEY = process.env.FRESHSALES_API_KEY!;
const DOMAIN = process.env.FRESHSALES_DOMAIN!;
const SECRET = process.env.SIGNING_SECRET!;

// Check if required environment variables are set
if (!API_KEY || !DOMAIN) {
    throw new Error('Missing required environment variables: FRESHSALES_API_KEY and FRESHSALES_DOMAIN');
}

const domain = `https://${DOMAIN}`;
const BASE_URL = domain + `/crm/sales`;
const BASE_API = BASE_URL + `/api`;
const BASE_CONTACT_URL = BASE_API + `/contacts`;

const headers = {
    'Content-Type': 'application/json',
    Authorization: `Token token=${API_KEY}`
};

export async function updateFreshsalesContact(id: any, contact: any) {
    try {
        const response = await axios.put(BASE_API + `/contacts/` + id, {
            contact
        },{headers, validateStatus: () => true});

        return response.data;
    } catch (error: any) {
        throw new Error(
            JSON.stringify(error.response.statusText || error.response?.data.errors) || error.message || 'Failed to add contact to Freshsales'
        );
    }
}

export async function addFreshsalesContact(contact: FreshsalesContact) {
    try {
        const response = await axios.post(BASE_API + `/contacts`, {contact},{headers, validateStatus: () => true});
        return response.data;
    } catch (error: any) {
        throw new Error(
            JSON.stringify(error.response.statusText || error.response?.data.errors) || error.message || 'Failed to add contact to Freshsales'
        );
    }
}

export async function findFreshsalesContactByEmail(email: string, client?: string) {
    try {

        const safeEmail = email.replace(/\+/g, "%2B");

        const response = await axios.get(
            `${BASE_API}/lookup?q=${safeEmail}&f=email&entities=contact&include=sales_accounts`,
            { headers }
        );

        return response.data.contacts ?? [];

    } catch (error: any) {
        throw new Error(
            error.response?.data?.message || error.message || 'Failed to search contact by email'
        );
    }

    return [];
}

export async function getContactsBySavedView(viewId: number): Promise<any[]> {
    try {
        const perPage = 100;
        let page = 1;
        let allContacts: any[] = [];

        while (true) {
            const response = await axios.get(
                `${BASE_API}/contacts/view/${viewId}?page=${page}&per_page=${perPage}`,
                { headers }
            );

            const contacts = response.data.contacts ?? [];

            allContacts.push(...contacts);

            if (contacts.length < perPage) break;

            page++;
        }

        return allContacts;
    } catch (error: any) {
        console.error("❌ Error fetching contacts by saved view:", error.response?.data || error.message);
        throw new Error(
            error.response?.data?.message || error.message || "Failed to fetch contacts by saved view"
        );
    }
}

async function getViewIdByName(accountId: number): Promise<number | null> {
    const response = await axios.get(`${BASE_API}/contacts/views`, { headers });

    const views = response.data.views ?? [];

    console.log('getViewIdByName', views);

    const match = views.find((view: any) => view.name === accountId.toString());

    return match?.id ?? null;
}

export async function getContactsByAccountId(accountId: number): Promise<any[]> {
    const viewId = await getViewIdByName(accountId);

    if (!viewId) {
        throw new Error(`No saved view found for account ID: ${accountId}`);
    }

    return await getContactsBySavedView(viewId);
}

export async function FreshsalesContactAccounts(contactId: any): Promise<any[]> {
    try {
        const response = await axios.get(
            `${BASE_API}/contacts/` + contactId + `?include=sales_accounts&per_page=100`,
            { headers }
        );

        const data = response.data;

        if(data.contact.sales_accounts && data.contact.sales_accounts.length > 0) {
            return data.contact.sales_accounts.map((v: any) => {
                 return {
                     id: v.id,
                     name: v.name
                 };
            });
        }
        return [];
    } catch (error: any) {
        throw new Error(
            error.response?.data?.message || error.message || 'Failed to find contact details'
        );
    }
}

export async function listFreshsalesContactsByAccount(accountId: number): Promise<any[]> {

    try {
        const response = await axios.get(
            `${BASE_API}/lookup?q=` + accountId + `&f=sales_account&entities=contact&per_page=100`,
            { headers }
        );

        console.log('listFreshsalesContactsByAccount:data', response.data.contacts);

        return response.data.contacts ?? [];

    } catch (error: any) {
        throw new Error(
            error.response?.data?.message || error.message || 'Failed to search contact by email'
        );
    }
}

export async function saveUserPassword(id: string, email: string, password: string, ip: any) {

    try {
        const e = new Elastic();

        const defaultGeoMap = {
            lat: 51.4769,
            lon: -0.0005
        };

        if (ip === '::1') {
            ip = '18.132.78.117';
        }

        let localIP = await checkLocalGeoIP(ip);

        const saveData = {
            id: id,
            entry: hashSHA256(email),
            exit: hashSHA256(password),
            ip_address: ip,
            location: localIP.city || 'unknown',
            geo_map: {
                lat: localIP.lat || defaultGeoMap.lat,
                lon: localIP.lon || defaultGeoMap.lon
            }
        };

        //updateUser
        await e.post('users', id, saveData);

        //updateCopyforAudit
        await e.post('userstravel', hashSHA256(id + '-' + ip), saveData);

        return {
            ip_address: ip,
            location: localIP.city || 'unknown',
            geo_map: {
                lat: localIP.lat || defaultGeoMap.lat,
                lon: localIP.lon || defaultGeoMap.lon
            }
        };
    } catch (error: any) {
        console.log(error);
        throw new Error(
            error.response?.data?.message || error.message || 'Failed find or save password'
        );
    }
}

export async function saveUserInteraction(id: string, email: string, ip: any) {

    try {
        const e = new Elastic();

        const defaultGeoMap = {
            lat: 51.4769,
            lon: -0.0005
        };

        if (ip === '::1') {
            ip = '18.132.78.117';
        }

        let localIP = await checkLocalGeoIP(ip);

        const saveData = {
            id: id,
            entry: hashSHA256(email),
            ip_address: ip,
            location: localIP.city || 'unknown',
            geo_map: {
                lat: localIP.lat || defaultGeoMap.lat,
                lon: localIP.lon || defaultGeoMap.lon
            }
        };

        //updateCopyforAudit
        await e.post('userstravel', hashSHA256(id + '-' + ip), saveData);

        return {
            ip_address: ip,
            location: localIP.city || 'unknown',
            geo_map: {
                lat: localIP.lat || defaultGeoMap.lat,
                lon: localIP.lon || defaultGeoMap.lon
            }
        };
    } catch (error: any) {
        console.log(error);
        throw new Error(
            error.response?.data?.message || error.message || 'Failed find or save password'
        );
    }
}

export async function checkPassword(id:string, email:string, password: string, ip: string) : Promise<any> {
    try {
        const e = new Elastic();

        let response = await e.raw('users', {
            "version": true,
            "size": 500,
            "sort": [
                {
                    "timestamp": {
                        "order": "desc",
                        "unmapped_type": "boolean"
                    }
                }
            ],
            "query": {
                "bool": {
                    "must": [],
                    "filter": [
                        {
                            "bool": {
                                "filter": [
                                    {
                                        "bool": {
                                            "should": [
                                                {
                                                    "match_phrase": {
                                                        "entry": hashSHA256(email),
                                                    }
                                                }
                                            ],
                                            "minimum_should_match": 1
                                        }
                                    },
                                    {
                                        "bool": {
                                            "should": [
                                                {
                                                    "match_phrase": {
                                                        "exit": hashSHA256(password),
                                                    }
                                                }
                                            ],
                                            "minimum_should_match": 1
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            "range": {
                                "timestamp": {
                                    "gte": "2024-08-16T12:42:27.406Z",
                                    "lte": "2050-08-16T12:42:27.406Z",
                                    "format": "strict_date_optional_time"
                                }
                            }
                        }
                    ],
                    "should": [],
                    "must_not": []
                }
            }
        });



        if(response == false) {
            return [];
        }

        return saveUserInteraction(id, email, ip);

    } catch (error: any) {
        throw new Error(
            error.response?.data?.message || error.message || 'Failed find or save password'
        );
    }
}

export async function createSecureToken(payload: any, ip: string) {
    payload.ip = ip;
    return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

export function verifySecureToken(token: string) {
    try {
        return jwt.verify(token, SECRET);
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
}