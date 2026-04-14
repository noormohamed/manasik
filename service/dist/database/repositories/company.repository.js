"use strict";
/**
 * Company Repository
 */
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
exports.CompanyRepository = void 0;
const repository_1 = require("../repository");
const company_1 = require("../../models/company");
class CompanyRepository extends repository_1.BaseRepository {
    constructor() {
        super('companies');
    }
    /**
     * Find companies by service type
     */
    findByServiceType(serviceType_1) {
        return __awaiter(this, arguments, void 0, function* (serviceType, limit = 10, offset = 0) {
            const query = `SELECT * FROM ${this.tableName} WHERE service_type = ? LIMIT ? OFFSET ?`;
            const results = yield this.query(query, [serviceType, limit, offset]);
            return results.map(row => this.mapRowToCompany(row));
        });
    }
    /**
     * Find companies by city
     */
    findByCity(city_1) {
        return __awaiter(this, arguments, void 0, function* (city, limit = 10, offset = 0) {
            const query = `SELECT * FROM ${this.tableName} WHERE city = ? LIMIT ? OFFSET ?`;
            const results = yield this.query(query, [city, limit, offset]);
            return results.map(row => this.mapRowToCompany(row));
        });
    }
    /**
     * Find verified companies
     */
    findVerified() {
        return __awaiter(this, arguments, void 0, function* (limit = 10, offset = 0) {
            const query = `SELECT * FROM ${this.tableName} WHERE is_verified = TRUE AND is_active = TRUE LIMIT ? OFFSET ?`;
            const results = yield this.query(query, [limit, offset]);
            return results.map(row => this.mapRowToCompany(row));
        });
    }
    /**
     * Find active companies
     */
    findActive() {
        return __awaiter(this, arguments, void 0, function* (limit = 10, offset = 0) {
            const query = `SELECT * FROM ${this.tableName} WHERE is_active = TRUE LIMIT ? OFFSET ?`;
            const results = yield this.query(query, [limit, offset]);
            return results.map(row => this.mapRowToCompany(row));
        });
    }
    /**
     * Count companies by service type
     */
    countByServiceType(serviceType) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.count('service_type = ?', [serviceType]);
        });
    }
    /**
     * Count verified companies
     */
    countVerified() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.count('is_verified = TRUE AND is_active = TRUE');
        });
    }
    /**
     * Search companies by name
     */
    searchByName(name_1) {
        return __awaiter(this, arguments, void 0, function* (name, limit = 10, offset = 0) {
            const query = `SELECT * FROM ${this.tableName} WHERE name LIKE ? LIMIT ? OFFSET ?`;
            const results = yield this.query(query, [`%${name}%`, limit, offset]);
            return results.map(row => this.mapRowToCompany(row));
        });
    }
    /**
     * Map database row to Company model
     */
    mapRowToCompany(row) {
        return company_1.Company.create({
            id: row.id,
            name: row.name,
            serviceType: row.service_type,
            email: row.email,
            description: row.description,
            logo: row.logo,
            website: row.website,
            phone: row.phone,
            address: row.address,
            city: row.city,
            country: row.country,
        });
    }
}
exports.CompanyRepository = CompanyRepository;
