"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.app = void 0;
const koa_1 = __importDefault(require("koa"));
const http_1 = __importDefault(require("http"));
const koa_bodyparser_1 = __importDefault(require("koa-bodyparser"));
const cors_1 = __importDefault(require("@koa/cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const error_1 = require("./middleware/error");
const debug_1 = require("./middleware/debug");
const api_routes_1 = require("./routes/api.routes");
const connection_1 = require("./database/connection");
const admin_routes_1 = __importStar(require("./routes/admin.routes"));
const checkout_routes_1 = __importStar(require("./routes/checkout.routes"));
dotenv_1.default.config();
const app = new koa_1.default();
exports.app = app;
// CORS middleware - MUST be first
app.use((0, cors_1.default)({
    origin: "*"
}));
// Logging middleware
app.use((ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${ctx.method} ${ctx.url}`);
    yield next();
}));
// Global middleware
app.use(debug_1.debugHandler);
app.use(error_1.errorHandler);
app.use((0, koa_bodyparser_1.default)());
const PORT = (() => {
    const arg = process.argv.find(arg => arg.startsWith('--port='));
    const val = arg ? parseInt(arg.split('=')[1], 10) : undefined;
    return val || process.env.PORT || 3001;
})();
if (isNaN(PORT)) {
    console.error('❌ Invalid port passed. Exiting.');
    process.exit(1);
}
let server;
let serverStarted = false;
console.log('Starting database initialization...');
// Initialize database and start server
const dbPromise = (0, connection_1.initializeDatabase)();
console.log('Database promise created:', !!dbPromise);
dbPromise
    .then((db) => {
    console.error('🔴 THEN CALLBACK CALLED!');
    if (serverStarted)
        return;
    serverStarted = true;
    console.error('🔴 Database initialized, initializing admin routes...');
    // Initialize admin routes with database
    (0, admin_routes_1.initializeAdminRoutes)(db);
    // Initialize checkout routes with database
    (0, checkout_routes_1.initializeCheckoutRoutes)(db);
    console.error('🔴 Mounting admin router...');
    // Mount admin router BEFORE API router so it takes precedence
    app.use(admin_routes_1.default.routes());
    app.use(admin_routes_1.default.allowedMethods());
    // Mount checkout router
    app.use(checkout_routes_1.default.routes());
    app.use(checkout_routes_1.default.allowedMethods());
    console.error('🔴 Mounting API router...');
    // Mount API router
    const apiRouter = (0, api_routes_1.createApiRouter)();
    app.use(apiRouter.routes());
    app.use(apiRouter.allowedMethods());
    console.error('🔴 Creating server...');
    // Create server AFTER mounting all routers
    exports.server = server = http_1.default.createServer(app.callback());
    server.listen(PORT, () => {
        console.log(`🚀 API server started on port ${PORT}`);
        console.log(`📍 REST base: http://localhost:${PORT}/api`);
    });
})
    .catch((error) => {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
});
