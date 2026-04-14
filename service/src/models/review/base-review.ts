/**
 * Base review class - extensible foundation for all review types
 * Each service type can have reviews with different criteria
 */

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED';

export interface ReviewCriteria {
  [key: string]: number;  // e.g., { cleanliness: 5, service: 4, value: 3 }
}

export abstract class BaseReview {
  protected id!: string;
  protected bookingId!: string;
  protected companyId!: string;
  protected customerId!: string;
  protected serviceType!: string;  // 'HOTEL', 'TAXI', etc.
  protected rating!: number;  // 1-5
  protected title!: string;
  protected comment!: string;
  protected criteria!: ReviewCriteria;  // Service-specific rating criteria
  protected status!: ReviewStatus;
  protected verified: boolean = false;  // Verified purchase
  protected helpful: number = 0;  // Helpful count
  protected createdAt!: Date;
  protected updatedAt!: Date;

  // Getters
  getId(): string { return this.id; }
  getBookingId(): string { return this.bookingId; }
  getCompanyId(): string { return this.companyId; }
  getCustomerId(): string { return this.customerId; }
  getServiceType(): string { return this.serviceType; }
  getRating(): number { return this.rating; }
  getTitle(): string { return this.title; }
  getComment(): string { return this.comment; }
  getCriteria(): ReviewCriteria { return this.criteria; }
  getStatus(): ReviewStatus { return this.status; }
  isVerified(): boolean { return this.verified; }
  getHelpful(): number { return this.helpful; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }

  // Setters
  setRating(rating: number): this {
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new Error('rating must be between 1 and 5');
    }
    this.rating = rating;
    return this.touch();
  }

  setTitle(title: string): this {
    if (!title || title.trim().length === 0) throw new Error('title cannot be empty');
    this.title = title;
    return this.touch();
  }

  setComment(comment: string): this {
    if (!comment || comment.trim().length === 0) throw new Error('comment cannot be empty');
    this.comment = comment;
    return this.touch();
  }

  setCriteria(criteria: ReviewCriteria): this {
    this.criteria = criteria;
    return this.touch();
  }

  setStatus(status: ReviewStatus): this {
    this.status = status;
    return this.touch();
  }

  setVerified(verified: boolean): this {
    this.verified = verified;
    return this.touch();
  }

  incrementHelpful(): this {
    this.helpful++;
    return this.touch();
  }

  protected touch(): this {
    this.updatedAt = new Date();
    return this;
  }

  /**
   * Validate review - override in subclasses for service-specific validation
   */
  abstract validate(): boolean;

  /**
   * Convert to JSON for storage/transmission
   */
  toJSON(): any {
    return {
      id: this.id,
      bookingId: this.bookingId,
      companyId: this.companyId,
      customerId: this.customerId,
      serviceType: this.serviceType,
      rating: this.rating,
      title: this.title,
      comment: this.comment,
      criteria: this.criteria,
      status: this.status,
      verified: this.verified,
      helpful: this.helpful,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Create from JSON - override in subclasses
   */
  static fromJSON(data: any): BaseReview {
    throw new Error('fromJSON must be implemented in subclass');
  }
}
