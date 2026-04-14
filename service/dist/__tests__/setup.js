/**
 * Jest Setup File
 */
// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_key';
process.env.JWT_EXPIRY = '1h';
process.env.JWT_REFRESH_EXPIRY = '7d';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '3306';
process.env.DB_USER = 'booking_user';
process.env.DB_PASSWORD = 'booking_password';
process.env.DB_NAME = 'booking_platform';
// Enable all feature flags for testing
process.env.ENABLE_AUTH_ENDPOINTS = 'true';
process.env.ENABLE_USER_ENDPOINTS = 'true';
process.env.ENABLE_HOTEL_ENDPOINTS = 'true';
process.env.ENABLE_CHECKOUT_ENDPOINTS = 'true';
process.env.ENABLE_REGISTRATION = 'true';
process.env.ENABLE_LOGIN = 'true';
process.env.ENABLE_REFRESH_TOKEN = 'true';
process.env.ENABLE_GUEST_CHECKOUT = 'true';
process.env.ENABLE_HOTEL_LISTING = 'true';
process.env.ENABLE_HOTEL_DETAILS = 'true';
process.env.ENABLE_ROOM_AVAILABILITY = 'true';
process.env.ENABLE_HOTEL_BOOKING = 'true';
process.env.ENABLE_CHECKOUT_SESSION = 'true';
process.env.ENABLE_CHECKOUT_ITEMS = 'true';
process.env.ENABLE_CHECKOUT_DISCOUNT = 'true';
process.env.ENABLE_CHECKOUT_CONVERSION = 'true';
process.env.ENABLE_CHECKOUT_COMPLETE = 'true';
// Suppress console logs during tests
global.console = Object.assign(Object.assign({}, console), { log: jest.fn(), debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() });
