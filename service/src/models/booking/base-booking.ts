/**
 * Base booking class - extensible foundation for all booking types
 * Each service type (hotel, taxi, experience, etc.) extends this
 */

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'REFUNDED';

export interface BookingMetadata {
  [key: string]: any;  // Service-specific data
}

export abstract class BaseBooking {
  protected id!: string;
  protected companyId!: string;
  protected customerId!: string;
  protected serviceType!: string;  // 'HOTEL', 'TAXI', etc.
  protected status!: BookingStatus;
  protected currency!: string;
  protected subtotal!: number;
  protected tax!: number;
  protected total!: number;
  protected metadata!: BookingMetadata;  // Service-specific fields
  protected createdAt!: Date;
  protected updatedAt!: Date;

  // Getters
  getId(): string { return this.id; }
  getCompanyId(): string { return this.companyId; }
  getCustomerId(): string { return this.customerId; }
  getServiceType(): string { return this.serviceType; }
  getStatus(): BookingStatus { return this.status; }
  getCurrency(): string { return this.currency; }
  getSubtotal(): number { return this.subtotal; }
  getTax(): number { return this.tax; }
  getTotal(): number { return this.total; }
  getMetadata(): BookingMetadata { return this.metadata; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }

  // Setters
  setStatus(status: BookingStatus): this {
    this.status = status;
    return this.touch();
  }

  setTotals(subtotal: number, tax: number, total: number): this {
    if (!Number.isFinite(subtotal) || subtotal < 0) throw new Error('subtotal must be >= 0');
    if (!Number.isFinite(tax) || tax < 0) throw new Error('tax must be >= 0');
    if (!Number.isFinite(total) || total < 0) throw new Error('total must be >= 0');
    this.subtotal = subtotal;
    this.tax = tax;
    this.total = total;
    return this.touch();
  }

  setMetadata(metadata: BookingMetadata): this {
    this.metadata = { ...this.metadata, ...metadata };
    return this.touch();
  }

  protected touch(): this {
    this.updatedAt = new Date();
    return this;
  }

  /**
   * Validate booking - override in subclasses for service-specific validation
   */
  abstract validate(): boolean;

  /**
   * Convert to JSON for storage/transmission
   */
  toJSON(): any {
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
  static fromJSON(data: any): BaseBooking {
    throw new Error('fromJSON must be implemented in subclass');
  }
}
