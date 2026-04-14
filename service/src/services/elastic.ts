// @ts-nocheck
// This file is not currently used - requires @elastic/elasticsearch package
import {Client} from "@elastic/elasticsearch";
import * as dotenv from 'dotenv';

dotenv.config();

interface fetchRequestBody {
    query?: any;
}

interface fetchRequest {
    index: string;
    size: number;
    body: fetchRequestBody
}

export class Elastic {

    public client: Client;

    constructor() {

        const ElasticHost = process.env.ELASTIC_STORE_LOCAL!;

        this.client = new Client({
            node: ElasticHost,
            headers: {
                'Accept': 'application/json',
                'content-type': 'application/json'
            },
        });

    }

    async delete(idx : string, id : string) {
        return await this.client.delete({
            index: idx,
            id: id,
        });
    }

    async get(idx : string, id : string) {
        return await this.client.get({
            index: idx,
            id: id,
        });
    }

    async post(idx : string, id : string, data : object) {

        console.log('Elastic:Post:' + idx);
        // @ts-ignore
        data.timestamp = new Date().toISOString();

        try {
            return await this.client.index({
                index: idx.toLowerCase(),
                id: id,
                body: data
            });
        } catch (e: any) {
            console.log(data);
            console.log(e.meta);
            console.log(e.message);
        }
    }

    async fetch(idx : string, params? : object, size? : number | 10000, customBody?: boolean | false) : Promise<Array<any>> {

        return new Promise(async (resolve, reject) => {

            if(!size) {
                size = 1000;
            }

            let data: fetchRequest = {
                index: idx,
                size: size,
                body: {}
            };

            if(customBody === true) {
                data.body.query = params;
            } else if(params) {
                if (Object.entries(params).length > 0) {
                    data.body.query =  {
                        match: params
                    }
                }
            }

            let record = await this.client.search(data).catch((err) => {
                console.log(err.meta.body);
                resolve([])
            });

            // @ts-ignore
            if(record && record.body && record.body.hits) {
                // @ts-ignore
                resolve(record.body.hits.hits);
            } else {
                console.log('bad request', idx, params);
            }
        })
    }

    async raw(idx : string, body : object, size? : number | 10000, returnType?: string | 'all') : Promise<any> {
        return new Promise(async (resolve, reject) => {

            let data = {
                index: idx,
                size: size || 1000,
                body: body
            };

            let record = await this.client.search(data).catch((err) => {
                resolve([]);
            });

            if(record && record.body) {


                if(returnType === 'aggregations') {
                    const aggregations = Object.entries(record.body.aggregations);

                    if(aggregations.length === 1) {
                        resolve(record.body.aggregations[Object.keys(record.body.aggregations)[0]].buckets);
                    }
                    resolve(record.body.aggregations);
                } else {
                    const data = record.body.hits.hits.map((v: any) => {
                        return v._source;
                    });

                    resolve(data || []);
                }
            } else {
                console.log('bad request', idx, body);
            }
        })
    }

    async fetchWithDate(idx : string, filter : object, size? : number | 10000) : Promise<Array<any>> {
        return new Promise(async (resolve, reject) => {

            if(!size) {
                size = 1000;
            }

            let data = {
                index: idx,
                size: size,
                body: {}
            };

            if(Object.entries(filter).length > 0) {
                data.body = {
                    query: filter
                }
            }

            let record = await this.client.search(data).catch((err) => {
                resolve([]);
            });

            // @ts-ignore
            if(record && record.body && record.body.hits) {
                // @ts-ignore
                resolve(record.body.hits.hits);
            } else {
                console.log('bad request', idx, filter);
            }
        })
    }

}
