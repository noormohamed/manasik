/**
 * Credits API Routes (Koa)
 */

import Router from 'koa-router';
import { Context } from 'koa';
import { createCreditsService } from '../services/credits.service';
import { Database, getPool } from '../database/connection';
import { v4 as uuidv4 } from 'uuid';

const getDatabase = () => new Database(getPool());

export const createCreditsRoutes = () => {
  const router = new Router({ prefix: '/credits' });

  // Get user's credit balance
  router.get('/balance', async (ctx: Context) => {
    try {
      const user = (ctx.state as any).user;
      if (!user) {
        ctx.status = 401;
        ctx.body = { success: false, error: 'Authentication required' };
        return;
      }

      const database = getDatabase();
      const creditsService = createCreditsService(database);
      
      const balance = await creditsService.getUserBalance(user.id);
      const gbpValue = balance.balance / 100;
      
      ctx.body = {
        success: true,
        data: {
          ...balance,
          gbpValue,
          formatted: creditsService.formatCredits(balance.balance),
        },
      };
    } catch (error: any) {
      console.error('Error getting credit balance:', error);
      ctx.status = 500;
      ctx.body = { success: false, error: error.message };
    }
  });

  // Get credit transaction history
  router.get('/transactions', async (ctx: Context) => {
    try {
      const user = (ctx.state as any).user;
      if (!user) {
        ctx.status = 401;
        ctx.body = { success: false, error: 'Authentication required' };
        return;
      }

      const limit = parseInt(ctx.query.limit as string) || 50;
      const offset = parseInt(ctx.query.offset as string) || 0;
      
      const database = getDatabase();
      const creditsService = createCreditsService(database);
      
      const transactions = await creditsService.getTransactionHistory(user.id, limit, offset);
      
      ctx.body = {
        success: true,
        data: transactions,
      };
    } catch (error: any) {
      console.error('Error getting credit transactions:', error);
      ctx.status = 500;
      ctx.body = { success: false, error: error.message };
    }
  });

  // Convert amount to credits (preview) - public endpoint
  router.get('/convert', async (ctx: Context) => {
    try {
      const amount = parseFloat(ctx.query.amount as string);
      const currency = (ctx.query.currency as string) || 'GBP';
      
      if (isNaN(amount) || amount <= 0) {
        ctx.status = 400;
        ctx.body = { success: false, error: 'Invalid amount' };
        return;
      }
      
      const database = getDatabase();
      const creditsService = createCreditsService(database);
      
      const result = await creditsService.convertToCredits(amount, currency);
      
      ctx.body = {
        success: true,
        data: {
          originalAmount: amount,
          originalCurrency: currency,
          credits: result.credits,
          gbpEquivalent: result.gbpAmount,
          exchangeRate: result.exchangeRate,
          formatted: creditsService.formatCredits(result.credits),
        },
      };
    } catch (error: any) {
      console.error('Error converting to credits:', error);
      ctx.status = 500;
      ctx.body = { success: false, error: error.message };
    }
  });

  // Get exchange rates - public endpoint
  router.get('/exchange-rates', async (ctx: Context) => {
    try {
      const database = getDatabase();
      const creditsService = createCreditsService(database);
      
      const rates = await creditsService.getAllExchangeRates();
      
      ctx.body = {
        success: true,
        data: rates,
      };
    } catch (error: any) {
      console.error('Error getting exchange rates:', error);
      ctx.status = 500;
      ctx.body = { success: false, error: error.message };
    }
  });

  // Admin: Update exchange rate
  router.put('/exchange-rates', async (ctx: Context) => {
    try {
      const user = (ctx.state as any).user;
      if (!user) {
        ctx.status = 401;
        ctx.body = { success: false, error: 'Authentication required' };
        return;
      }

      // @ts-ignore
      const body = ctx.request.body || {};
      const { fromCurrency, toCurrency, rate } = body as any;
      
      if (!fromCurrency || !toCurrency || !rate) {
        ctx.status = 400;
        ctx.body = { success: false, error: 'Missing required fields' };
        return;
      }
      
      const database = getDatabase();
      const creditsService = createCreditsService(database);
      
      await creditsService.updateExchangeRate(fromCurrency, toCurrency, rate, 'admin');
      
      ctx.body = {
        success: true,
        message: `Exchange rate updated: ${fromCurrency} → ${toCurrency} = ${rate}`,
      };
    } catch (error: any) {
      console.error('Error updating exchange rate:', error);
      ctx.status = 500;
      ctx.body = { success: false, error: error.message };
    }
  });

  // Admin: Add bonus credits to user
  router.post('/bonus', async (ctx: Context) => {
    try {
      const user = (ctx.state as any).user;
      if (!user) {
        ctx.status = 401;
        ctx.body = { success: false, error: 'Authentication required' };
        return;
      }

      // @ts-ignore
      const body = ctx.request.body || {};
      const { userId, credits, description } = body as any;
      
      if (!userId || !credits) {
        ctx.status = 400;
        ctx.body = { success: false, error: 'Missing required fields' };
        return;
      }
      
      const database = getDatabase();
      const creditsService = createCreditsService(database);
      
      // Get current balance
      const currentBalance = await creditsService.getUserBalance(userId);
      const newBalance = currentBalance.balance + credits;
      
      // Update balance
      await database.query(
        `UPDATE user_credits SET balance = ?, lifetime_earned = lifetime_earned + ? WHERE user_id = ?`,
        [newBalance, credits, userId]
      );
      
      // Log transaction
      const transactionId = uuidv4();
      await database.query(
        `INSERT INTO credit_transactions 
         (id, user_id, type, amount, balance_after, description)
         VALUES (?, ?, 'BONUS', ?, ?, ?)`,
        [transactionId, userId, credits, newBalance, description || `Bonus credits: ${credits}`]
      );
      
      ctx.body = {
        success: true,
        data: {
          userId,
          creditsAdded: credits,
          newBalance,
          formatted: creditsService.formatCredits(newBalance),
        },
      };
    } catch (error: any) {
      console.error('Error adding bonus credits:', error);
      ctx.status = 500;
      ctx.body = { success: false, error: error.message };
    }
  });

  return router;
};

