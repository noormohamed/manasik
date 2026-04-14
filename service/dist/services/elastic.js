"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Elastic = void 0;
// @ts-nocheck
// This file is not currently used - requires @elastic/elasticsearch package
const elasticsearch_1 = require("@elastic/elasticsearch");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
class Elastic {
    constructor() {
        const ElasticHost = process.env.ELASTIC_STORE_LOCAL;
        this.client = new elasticsearch_1.Client({
            node: ElasticHost,
            headers: {
                'Accept': 'application/json',
                'content-type': 'application/json'
            },
        });
    }
    delete(idx, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.delete({
                index: idx,
                id: id,
            });
        });
    }
    get(idx, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.get({
                index: idx,
                id: id,
            });
        });
    }
    post(idx, id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Elastic:Post:' + idx);
            // @ts-ignore
            data.timestamp = new Date().toISOString();
            try {
                return yield this.client.index({
                    index: idx.toLowerCase(),
                    id: id,
                    body: data
                });
            }
            catch (e) {
                console.log(data);
                console.log(e.meta);
                console.log(e.message);
            }
        });
    }
    fetch(idx, params, size, customBody) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (!size) {
                    size = 1000;
                }
                let data = {
                    index: idx,
                    size: size,
                    body: {}
                };
                if (customBody === true) {
                    data.body.query = params;
                }
                else if (params) {
                    if (Object.entries(params).length > 0) {
                        data.body.query = {
                            match: params
                        };
                    }
                }
                let record = yield this.client.search(data).catch((err) => {
                    console.log(err.meta.body);
                    resolve([]);
                });
                // @ts-ignore
                if (record && record.body && record.body.hits) {
                    // @ts-ignore
                    resolve(record.body.hits.hits);
                }
                else {
                    console.log('bad request', idx, params);
                }
            }));
        });
    }
    raw(idx, body, size, returnType) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let data = {
                    index: idx,
                    size: size || 1000,
                    body: body
                };
                let record = yield this.client.search(data).catch((err) => {
                    resolve([]);
                });
                if (record && record.body) {
                    if (returnType === 'aggregations') {
                        const aggregations = Object.entries(record.body.aggregations);
                        if (aggregations.length === 1) {
                            resolve(record.body.aggregations[Object.keys(record.body.aggregations)[0]].buckets);
                        }
                        resolve(record.body.aggregations);
                    }
                    else {
                        const data = record.body.hits.hits.map((v) => {
                            return v._source;
                        });
                        resolve(data || []);
                    }
                }
                else {
                    console.log('bad request', idx, body);
                }
            }));
        });
    }
    fetchWithDate(idx, filter, size) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (!size) {
                    size = 1000;
                }
                let data = {
                    index: idx,
                    size: size,
                    body: {}
                };
                if (Object.entries(filter).length > 0) {
                    data.body = {
                        query: filter
                    };
                }
                let record = yield this.client.search(data).catch((err) => {
                    resolve([]);
                });
                // @ts-ignore
                if (record && record.body && record.body.hits) {
                    // @ts-ignore
                    resolve(record.body.hits.hits);
                }
                else {
                    console.log('bad request', idx, filter);
                }
            }));
        });
    }
}
exports.Elastic = Elastic;
