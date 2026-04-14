import Router from 'koa-router';
import { Context } from 'koa';
import * as haramGatesService from '../services/haram-gates.service';

export const createProximityRoutes = () => {
  const router = new Router({ prefix: '/proximity' });

  // Get all Haram gates
  router.get('/gates', async (ctx: Context) => {
    try {
      const gates = await haramGatesService.getAllGates();
      ctx.body = { gates };
    } catch (error: any) {
      console.error('Error fetching gates:', error);
      ctx.status = 500;
      ctx.body = { error: 'Failed to fetch gates' };
    }
  });

  // Get all nearby attractions
  router.get('/attractions', async (ctx: Context) => {
    try {
      const attractions = await haramGatesService.getAllAttractions();
      ctx.body = { attractions };
    } catch (error: any) {
      console.error('Error fetching attractions:', error);
      ctx.status = 500;
      ctx.body = { error: 'Failed to fetch attractions' };
    }
  });

  // Calculate distances from custom coordinates
  router.get('/calculate', async (ctx: Context) => {
    try {
      const { lat, lon } = ctx.query;
      
      if (!lat || !lon) {
        ctx.status = 400;
        ctx.body = { error: 'lat and lon query parameters are required' };
        return;
      }

      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lon as string);

      if (isNaN(latitude) || isNaN(longitude)) {
        ctx.status = 400;
        ctx.body = { error: 'Invalid coordinates' };
        return;
      }

      const gates = await haramGatesService.getGatesWithDistances(latitude, longitude);
      const attractions = await haramGatesService.getAttractionsWithDistances(latitude, longitude);

      ctx.body = {
        gates,
        attractions,
        recommendedGate: gates.find(g => g.isRecommended) || null
      };
    } catch (error: any) {
      console.error('Error calculating distances:', error);
      ctx.status = 500;
      ctx.body = { error: 'Failed to calculate distances' };
    }
  });

  return router;
};
