/**
 * Credits Service
 * Handles credit calculations, conversions, and transactions
 * 
 * Credits are 1:1 with GBP pence:
 * - 1 credit = £0.01
 * - £28.05 = 2805 credits
 * - $35.00 at 0.79 rate = £27.65 = 2765 credits
 */

import { v4 as uuidv4 } from 'uuid';

// Use a generic database interface
export interface DatabaseInterface {
  query(sql: string, params?: any[]): Promise<any>;
}

export interface CreditBalance {
  userId: string;
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  bookingId?: string;
  type: 'EARN' | 'SPEND' | 'REFUND' | 'ADJUSTMENT' | 'BONUS';
  amount: number;
  balanceAfter: number;
  currencyOriginal?: string;
  amountOriginal?: number;
  exchangeRate?: number;
  description: string;
  createdAt: Date;
}

export interface ExchangeRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  fetchedAt: Date;
}

export class CreditsService {
  constructor(private database: DatabaseInterface) {}

  /**
   * Convert monetary amount to credits
   * Credits are 1:1 with GBP pence
   * 
   * @param amount - The monetary amount (e.g., 28.05)
   * @param currency - The currency code (GBP, USD, EUR, SAR)
   * @returns Credits amount (integer)
   */
  async convertToCredits(amount: number, currency: string): Promise<{
    credits: number;
    gbpAmount: number;
    exchangeRate: number;
  }> {
    // Get exchange rate to GBP
    const exchangeRate = await this.getExchangeRate(currency, 'GBP');
    
    // Convert to GBP
    const gbpAmount = amount * exchangeRate;
    
    // Convert to credits (pence) - round to avoid floating point issues
    const credits = Math.round(gbpAmount * 100);
    
    return {
      credits,
      gbpAmount,
      exchangeRate,
    };
  }

  /**
   * Convert credits back to monetary amount
   * 
   * @param credits - The credits amount
   * @param targetCurrency - The target currency (default GBP)
   * @returns Monetary amount
   */
  async convertFromCredits(credits: number, targetCurrency: string = 'GBP'): Promise<{
    amount: number;
    exchangeRate: number;
  }> {
    // Credits to GBP (pence to pounds)
    const gbpAmount = credits / 100;
    
    if (targetCurrency === 'GBP') {
      return { amount: gbpAmount, exchangeRate: 1 };
    }
    
    // Get exchange rate from GBP to target currency
    const exchangeRate = await this.getExchangeRate('GBP', targetCurrency);
    const amount = gbpAmount * exchangeRate;
    
    return { amount, exchangeRate };
  }

  /**
   * Get exchange rate between two currencies
   */
  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) {
      return 1;
    }

    const query = `
      SELECT rate FROM exchange_rates 
      WHERE from_currency = ? AND to_currency = ?
      LIMIT 1
    `;
    
    const results = await this.database.query(query, [fromCurrency, toCurrency]);
    
    if (results.length > 0) {
      return parseFloat(results[0].rate);
    }
    
    // Try inverse rate
    const inverseQuery = `
      SELECT rate FROM exchange_rates 
      WHERE from_currency = ? AND to_currency = ?
      LIMIT 1
    `;
    
    const inverseResults = await this.database.query(inverseQuery, [toCurrency, fromCurrency]);
    
    if (inverseResults.length > 0) {
      return 1 / parseFloat(inverseResults[0].rate);
    }
    
    // Default fallback rates if not in database
    const fallbackRates: Record<string, number> = {
      'USD_GBP': 0.79,
      'EUR_GBP': 0.86,
      'SAR_GBP': 0.21,
      'GBP_USD': 1.27,
      'GBP_EUR': 1.16,
      'GBP_SAR': 4.76,
    };
    
    const key = `${fromCurrency}_${toCurrency}`;
    if (fallbackRates[key]) {
      return fallbackRates[key];
    }
    
    throw new Error(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
  }

  /**
   * Get or create user credit balance
   */
  async getUserBalance(userId: string): Promise<CreditBalance> {
    const query = `SELECT * FROM user_credits WHERE user_id = ?`;
    const results = await this.database.query(query, [userId]);
    
    if (results.length > 0) {
      return {
        userId: results[0].user_id,
        balance: parseInt(results[0].balance),
        lifetimeEarned: parseInt(results[0].lifetime_earned),
        lifetimeSpent: parseInt(results[0].lifetime_spent),
      };
    }
    
    // Create new balance record
    const id = uuidv4();
    await this.database.query(
      `INSERT INTO user_credits (id, user_id, balance, lifetime_earned, lifetime_spent) VALUES (?, ?, 0, 0, 0)`,
      [id, userId]
    );
    
    return {
      userId,
      balance: 0,
      lifetimeEarned: 0,
      lifetimeSpent: 0,
    };
  }

  /**
   * Add credits to user account (from a transaction)
   */
  async earnCredits(
    userId: string,
    amount: number,
    currency: string,
    bookingId?: string,
    description?: string
  ): Promise<CreditTransaction> {
    const { credits, gbpAmount, exchangeRate } = await this.convertToCredits(amount, currency);
    
    // Get current balance
    const currentBalance = await this.getUserBalance(userId);
    const newBalance = currentBalance.balance + credits;
    
    // Update balance
    await this.database.query(
      `UPDATE user_credits SET balance = ?, lifetime_earned = lifetime_earned + ? WHERE user_id = ?`,
      [newBalance, credits, userId]
    );
    
    // Log transaction
    const transactionId = uuidv4();
    await this.database.query(
      `INSERT INTO credit_transactions 
       (id, user_id, booking_id, type, amount, balance_after, currency_original, amount_original, exchange_rate, description)
       VALUES (?, ?, ?, 'EARN', ?, ?, ?, ?, ?, ?)`,
      [transactionId, userId, bookingId, credits, newBalance, currency, amount, exchangeRate, description || `Earned from ${currency} ${amount.toFixed(2)} transaction`]
    );
    
    return {
      id: transactionId,
      userId,
      bookingId,
      type: 'EARN',
      amount: credits,
      balanceAfter: newBalance,
      currencyOriginal: currency,
      amountOriginal: amount,
      exchangeRate,
      description: description || `Earned from ${currency} ${amount.toFixed(2)} transaction`,
      createdAt: new Date(),
    };
  }

  /**
   * Spend credits from user account
   */
  async spendCredits(
    userId: string,
    credits: number,
    bookingId?: string,
    description?: string
  ): Promise<CreditTransaction> {
    const currentBalance = await this.getUserBalance(userId);
    
    if (currentBalance.balance < credits) {
      throw new Error(`Insufficient credits. Available: ${currentBalance.balance}, Required: ${credits}`);
    }
    
    const newBalance = currentBalance.balance - credits;
    
    // Update balance
    await this.database.query(
      `UPDATE user_credits SET balance = ?, lifetime_spent = lifetime_spent + ? WHERE user_id = ?`,
      [newBalance, credits, userId]
    );
    
    // Log transaction
    const transactionId = uuidv4();
    await this.database.query(
      `INSERT INTO credit_transactions 
       (id, user_id, booking_id, type, amount, balance_after, description)
       VALUES (?, ?, ?, 'SPEND', ?, ?, ?)`,
      [transactionId, userId, bookingId, -credits, newBalance, description || `Spent ${credits} credits`]
    );
    
    return {
      id: transactionId,
      userId,
      bookingId,
      type: 'SPEND',
      amount: -credits,
      balanceAfter: newBalance,
      description: description || `Spent ${credits} credits`,
      createdAt: new Date(),
    };
  }

  /**
   * Refund credits to user account
   */
  async refundCredits(
    userId: string,
    credits: number,
    bookingId?: string,
    description?: string
  ): Promise<CreditTransaction> {
    const currentBalance = await this.getUserBalance(userId);
    const newBalance = currentBalance.balance + credits;
    
    // Update balance
    await this.database.query(
      `UPDATE user_credits SET balance = ? WHERE user_id = ?`,
      [newBalance, userId]
    );
    
    // Log transaction
    const transactionId = uuidv4();
    await this.database.query(
      `INSERT INTO credit_transactions 
       (id, user_id, booking_id, type, amount, balance_after, description)
       VALUES (?, ?, ?, 'REFUND', ?, ?, ?)`,
      [transactionId, userId, bookingId, credits, newBalance, description || `Refunded ${credits} credits`]
    );
    
    return {
      id: transactionId,
      userId,
      bookingId,
      type: 'REFUND',
      amount: credits,
      balanceAfter: newBalance,
      description: description || `Refunded ${credits} credits`,
      createdAt: new Date(),
    };
  }

  /**
   * Get credit transaction history for a user
   */
  async getTransactionHistory(userId: string, limit: number = 50, offset: number = 0): Promise<CreditTransaction[]> {
    const query = `
      SELECT * FROM credit_transactions 
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    const results = await this.database.query(query, [userId]);
    
    return results.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      bookingId: row.booking_id,
      type: row.type,
      amount: parseInt(row.amount),
      balanceAfter: parseInt(row.balance_after),
      currencyOriginal: row.currency_original,
      amountOriginal: row.amount_original ? parseFloat(row.amount_original) : undefined,
      exchangeRate: row.exchange_rate ? parseFloat(row.exchange_rate) : undefined,
      description: row.description,
      createdAt: new Date(row.created_at),
    }));
  }

  /**
   * Update exchange rate
   */
  async updateExchangeRate(fromCurrency: string, toCurrency: string, rate: number, source: string = 'manual'): Promise<void> {
    const id = uuidv4();
    await this.database.query(
      `INSERT INTO exchange_rates (id, from_currency, to_currency, rate, source, fetched_at)
       VALUES (?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE rate = ?, source = ?, fetched_at = NOW()`,
      [id, fromCurrency, toCurrency, rate, source, rate, source]
    );
  }

  /**
   * Get all exchange rates
   * Fetches live rates from Frankfurter API if cached rates are older than 1 hour
   */
  async getAllExchangeRates(): Promise<ExchangeRate[]> {
    // Try to fetch live rates and update the database
    await this.fetchAndCacheLiveRates();

    const query = `SELECT * FROM exchange_rates ORDER BY from_currency, to_currency`;
    const results = await this.database.query(query);
    
    if (results.length > 0) {
      return results.map((row: any) => ({
        fromCurrency: row.from_currency,
        toCurrency: row.to_currency,
        rate: parseFloat(row.rate),
        fetchedAt: new Date(row.fetched_at),
      }));
    }

    // Return fallback rates if database is empty
    return [
      { fromCurrency: 'USD', toCurrency: 'GBP', rate: 0.79, fetchedAt: new Date() },
      { fromCurrency: 'EUR', toCurrency: 'GBP', rate: 0.86, fetchedAt: new Date() },
      { fromCurrency: 'SAR', toCurrency: 'GBP', rate: 0.21, fetchedAt: new Date() },
      { fromCurrency: 'GBP', toCurrency: 'USD', rate: 1.27, fetchedAt: new Date() },
    ];
  }

  /**
   * Fetch live exchange rates from Frankfurter API and cache in database
   * Only fetches if cached rates are older than 1 hour
   */
  private async fetchAndCacheLiveRates(): Promise<void> {
    try {
      // Check if we have recent rates (less than 1 hour old)
      const recentCheck = await this.database.query(
        `SELECT fetched_at FROM exchange_rates WHERE source = 'frankfurter' ORDER BY fetched_at DESC LIMIT 1`
      );
      
      if (recentCheck.length > 0) {
        const lastFetch = new Date(recentCheck[0].fetched_at);
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        if (lastFetch > oneHourAgo) {
          return; // Rates are fresh enough
        }
      }

      // Fetch live rates from Frankfurter API (base GBP)
      const response = await fetch('https://api.frankfurter.dev/v1/latest?base=GBP&symbols=USD,EUR,SAR');
      if (!response.ok) {
        console.log('Frankfurter API returned non-OK status, using cached rates');
        return;
      }

      const data = await response.json();
      const rates = data.rates;

      if (rates) {
        // GBP -> other currencies
        if (rates.USD) {
          await this.updateExchangeRate('GBP', 'USD', rates.USD, 'frankfurter');
          await this.updateExchangeRate('USD', 'GBP', 1 / rates.USD, 'frankfurter');
        }
        if (rates.EUR) {
          await this.updateExchangeRate('GBP', 'EUR', rates.EUR, 'frankfurter');
          await this.updateExchangeRate('EUR', 'GBP', 1 / rates.EUR, 'frankfurter');
        }
        if (rates.SAR) {
          await this.updateExchangeRate('GBP', 'SAR', rates.SAR, 'frankfurter');
          await this.updateExchangeRate('SAR', 'GBP', 1 / rates.SAR, 'frankfurter');
        }
        console.log('Exchange rates updated from Frankfurter API:', rates);
      }
    } catch (error) {
      console.log('Failed to fetch live exchange rates, using cached/fallback rates:', (error as Error).message);
    }
  }

  /**
   * Format credits for display
   * @param credits - Credits amount
   * @returns Formatted string like "2,805 credits (£28.05)"
   */
  formatCredits(credits: number): string {
    const gbpAmount = credits / 100;
    return `${credits.toLocaleString()} credits (£${gbpAmount.toFixed(2)})`;
  }

  /**
   * Calculate credits from a booking transaction
   * This is the main method to call when processing a payment
   */
  async processBookingPayment(
    userId: string,
    bookingId: string,
    amount: number,
    currency: string
  ): Promise<{
    creditsEarned: number;
    gbpEquivalent: number;
    exchangeRate: number;
    transaction: CreditTransaction;
  }> {
    const { credits, gbpAmount, exchangeRate } = await this.convertToCredits(amount, currency);
    
    const transaction = await this.earnCredits(
      userId,
      amount,
      currency,
      bookingId,
      `Booking payment: ${currency} ${amount.toFixed(2)} → ${credits} credits`
    );
    
    return {
      creditsEarned: credits,
      gbpEquivalent: gbpAmount,
      exchangeRate,
      transaction,
    };
  }
}

export const createCreditsService = (database: DatabaseInterface): CreditsService => {
  return new CreditsService(database);
};
