"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Company = void 0;
/**
 * Company represents a service provider organization
 * (e.g., hotel chain, taxi company, restaurant group)
 */
class Company {
    constructor() {
        this.isVerified = false;
        this.isActive = true;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
    // Getters
    getId() { return this.id; }
    getName() { return this.name; }
    getServiceType() { return this.serviceType; }
    getDescription() { return this.description; }
    getLogo() { return this.logo; }
    getWebsite() { return this.website; }
    getEmail() { return this.email; }
    getPhone() { return this.phone; }
    getAddress() { return this.address; }
    getCity() { return this.city; }
    getCountry() { return this.country; }
    isVerifiedCompany() { return this.isVerified; }
    isActiveCompany() { return this.isActive; }
    getCreatedAt() { return this.createdAt; }
    getUpdatedAt() { return this.updatedAt; }
    // Setters
    setName(name) {
        this.name = name;
        return this.touch();
    }
    setDescription(description) {
        this.description = description;
        return this.touch();
    }
    setLogo(logo) {
        this.logo = logo;
        return this.touch();
    }
    setWebsite(website) {
        this.website = website;
        return this.touch();
    }
    setPhone(phone) {
        this.phone = phone;
        return this.touch();
    }
    setAddress(address, city, country) {
        this.address = address;
        this.city = city;
        this.country = country;
        return this.touch();
    }
    setVerified(verified) {
        this.isVerified = verified;
        return this.touch();
    }
    setActive(active) {
        this.isActive = active;
        return this.touch();
    }
    touch() {
        this.updatedAt = new Date();
        return this;
    }
    static create(params) {
        const company = new Company();
        company.id = params.id;
        company.name = params.name;
        company.serviceType = params.serviceType;
        company.email = params.email;
        company.description = params.description;
        company.logo = params.logo;
        company.website = params.website;
        company.phone = params.phone;
        company.address = params.address;
        company.city = params.city;
        company.country = params.country;
        company.createdAt = new Date();
        company.updatedAt = new Date();
        return company;
    }
}
exports.Company = Company;
