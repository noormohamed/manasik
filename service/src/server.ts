import Koa from 'koa';
import http from 'http';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import dotenv from 'dotenv';

import { errorHandler } from './middleware/error';
import { debugHandler } from './middleware/debug';
import { createApiRouter } from './routes/api.routes';
import { initializeDatabase } from './database/connection';
import adminRouter, { initializeAdminRoutes } from './routes/admin.routes';
import checkoutRouter, { initializeCheckoutRoutes } from './routes/checkout.routes';

dotenv.config();

const app = new Koa();

// CORS middleware - MUST be first (fully permissive)
app.use(cors({
  origin: (ctx) => ctx.request.header.origin || '*',
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  exposeHeaders: ['Content-Length', 'Date', 'X-Request-Id'],
}));

// Logging middleware
app.use(async (ctx, next) => {
  console.log(`${ctx.method} ${ctx.url}`);
  await next()
});

// Global middleware
app.use(debugHandler);
app.use(errorHandler);

app.use(bodyParser());

const PORT = (() => {
  const arg = process.argv.find(arg => arg.startsWith('--port='));
  const val = arg ? parseInt(arg.split('=')[1], 10) : undefined;
  return val || process.env.PORT || 3001;
})();

if (isNaN(PORT as any)) {
  console.error('❌ Invalid port passed. Exiting.');
  process.exit(1);
}

let server: any;
let serverStarted = false;

console.log('Starting database initialization...');

// Initialize database and start server
const dbPromise = initializeDatabase();
console.log('Database promise created:', !!dbPromise);

dbPromise
  .then((db) => {
    console.error('🔴 THEN CALLBACK CALLED!');
    if (serverStarted) return;
    serverStarted = true;
    
    console.error('🔴 Database initialized, initializing admin routes...');
    // Initialize admin routes with database
    initializeAdminRoutes(db);
    
    // Initialize checkout routes with database
    initializeCheckoutRoutes(db);
    
    console.error('🔴 Mounting admin router...');
    // Mount admin router BEFORE API router so it takes precedence
    app.use(adminRouter.routes());
    app.use(adminRouter.allowedMethods());
    
    // Mount checkout router
    app.use(checkoutRouter.routes());
    app.use(checkoutRouter.allowedMethods());
    
    console.error('🔴 Mounting API router...');
    // Mount API router
    console.error('🔴 About to call createApiRouter with db:', !!db);
    const apiRouter = createApiRouter(db);
    console.error('🔴 createApiRouter returned, mounting...');
    app.use(apiRouter.routes());
    app.use(apiRouter.allowedMethods());
    
    console.error('🔴 Creating server...');
    // Create server AFTER mounting all routers
    server = http.createServer(app.callback());
    
    server.listen(PORT, () => {
      console.log(`🚀 API server started on port ${PORT}`);
      console.log(`📍 REST base: http://localhost:${PORT}/api`);
    });
  })
  .catch((error) => {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  });

export { app, server };
