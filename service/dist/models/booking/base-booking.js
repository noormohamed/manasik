"use strict";
/**
 * Base booking class - extensible foundation for all booking types
 * Each service type (hotel, taxi, experience, etc.) extends this
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseBooking = void 0;
class BaseBooking {
    // Getters
    getId() { return this.id; }
    getCompanyId() { return this.companyId; }
    getCustomerId() { return this.customerId; }
    getServiceType() { return this.serviceType; }
    getStatus() { return this.status; }
    getCurrency() { return this.currency; }
    getSubtotal() { return this.subtotal; }
    getTax() { return this.tax; }
    getTotal() { return this.total; }
    getMetadata() { return this.metadata; }
    getCreatedAt() { return this.createdAt; }
    getUpdatedAt() { return this.updatedAt; }
    // Setters
    setStatus(status) {
        this.status = status;
        return this.touch();
    }
    setTotals(subtotal, tax, total) {
        if (!Number.isFinite(subtotal) || subtotal < 0)
            throw new Error('subtotal must be >= 0');
        if (!Number.isFinite(tax) || tax < 0)
            throw new Error('tax must be >= 0');
        if (!Number.isFinite(total) || total < 0)
            throw new Error('total must be >= 0');
        this.subtotal = subtotal;
        this.tax = tax;
        this.total = total;
        return this.touch();
    }
    setMetadata(metadata) {
        this.metadata = Object.assign(Object.assign({}, this.metadata), metadata);
        return this.touch();
    }
    touch() {
        this.updatedAt = new Date();
        return this;
    }
    /**
     * Convert to JSON for storage/transmission
     */
    toJSON() {
        return {
            id: this.id,
            companyId: this.companyId,
            customerId: this.customerId,
            serviceType: this.serviceType,
            status: this.status,
            currency: this.currency,
            subtotal: this.subtotal,
            tax: this.tax,
            total: this.total,
            metadata: this.metadata,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
    /**
     * Create from JSON - override in subclasses
     */
    static fromJSON(data) {
        throw new Error('fromJSON must be implemented in subclass');
    }
}
exports.BaseBooking = BaseBooking;
