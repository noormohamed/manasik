export class RoomRateEntity {
    private id!: string;          // UUID
    private listingId!: string;   // FK
    private roomTypeId!: string;  // FK

    private currency!: string;    // "GBP"
    private month!: string;       // "YYYY-MM"
    private date?: string;        // "YYYY-MM-DD" (optional override)
    private pricePerNight!: number; // numeric(10,2)

    private isBlocked!: boolean;  // for blackout dates (optional)
    private reason?: string;

    private createdAt!: Date;
    private updatedAt!: Date;

    // ---- Getters
    getId(): string { return this.id; }
    getListingId(): string { return this.listingId; }
    getRoomTypeId(): string { return this.roomTypeId; }

    getCurrency(): string { return this.currency; }
    getMonth(): string { return this.month; }
    getDate(): string | undefined { return this.date; }
    getPricePerNight(): number { return this.pricePerNight; }

    getIsBlocked(): boolean { return this.isBlocked; }
    getReason(): string | undefined { return this.reason; }

    getCreatedAt(): Date { return this.createdAt; }
    getUpdatedAt(): Date { return this.updatedAt; }

    // ---- Setters
    setCurrency(currency: string): this {
        this.currency = currency;
        return this.touch();
    }

    setMonth(month: string): this {
        // "YYYY-MM"
        if (!/^\d{4}-\d{2}$/.test(month)) throw new Error(`Invalid month: ${month}`);
        this.month = month;
        return this.touch();
    }

    setDate(date?: string): this {
        // undefined = monthly rate, defined = date override
        if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`Invalid date: ${date}`);
        this.date = date;
        return this.touch();
    }

    setPricePerNight(amount: number): this {
        if (!Number.isFinite(amount) || amount < 0) throw new Error("pricePerNight must be >= 0");
        this.pricePerNight = amount;
        return this.touch();
    }

    setBlocked(isBlocked: boolean, reason?: string): this {
        this.isBlocked = Boolean(isBlocked);
        this.reason = reason?.trim() || undefined;
        return this.touch();
    }

    // ---- Convenience
    isMonthlyRate(): boolean {
        return !this.date;
    }

    isDateOverride(): boolean {
        return Boolean(this.date);
    }

    private touch(): this {
        this.updatedAt = new Date();
        return this;
    }

    // Factory
    static create(params: {
        id: string;
        listingId: string;
        roomTypeId: string;
        currency: string;
        month: string;           // YYYY-MM
        pricePerNight: number;
        date?: string;           // YYYY-MM-DD optional
        isBlocked?: boolean;
        reason?: string;
    }): RoomRateEntity {
        const e = new RoomRateEntity();
        e.id = params.id;
        e.listingId = params.listingId;
        e.roomTypeId = params.roomTypeId;
        e.currency = params.currency;

        if (!/^\d{4}-\d{2}$/.test(params.month)) throw new Error(`Invalid month: ${params.month}`);
        e.month = params.month;

        if (params.date && !/^\d{4}-\d{2}-\d{2}$/.test(params.date)) throw new Error(`Invalid date: ${params.date}`);
        e.date = params.date;

        if (!Number.isFinite(params.pricePerNight) || params.pricePerNight < 0) {
            throw new Error("pricePerNight must be >= 0");
        }
        e.pricePerNight = params.pricePerNight;

        e.isBlocked = Boolean(params.isBlocked);
        e.reason = params.reason?.trim() || undefined;

        e.createdAt = new Date();
        e.updatedAt = new Date();
        return e;
    }
}
