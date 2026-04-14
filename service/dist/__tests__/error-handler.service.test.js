"use strict";
/**
 * Error Handler Service Tests
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const error_handler_service_1 = require("../services/error-handler.service");
describe('Error Handler Service', () => {
    describe('Custom Error Classes', () => {
        it('should create BadRequestError with correct status', () => {
            const error = new error_handler_service_1.BadRequestError('Invalid input');
            expect(error.statusCode).toBe(400);
            expect(error.message).toBe('Invalid input');
            expect(error.isOperational).toBe(true);
        });
        it('should create UnauthorizedError with correct status', () => {
            const error = new error_handler_service_1.UnauthorizedError('Not authenticated');
            expect(error.statusCode).toBe(401);
            expect(error.message).toBe('Not authenticated');
        });
        it('should create ForbiddenError with correct status', () => {
            const error = new error_handler_service_1.ForbiddenError('Access denied');
            expect(error.statusCode).toBe(403);
            expect(error.message).toBe('Access denied');
        });
        it('should create NotFoundError with correct status', () => {
            const error = new error_handler_service_1.NotFoundError('User not found');
            expect(error.statusCode).toBe(404);
            expect(error.message).toBe('User not found');
        });
        it('should create ConflictError with correct status', () => {
            const error = new error_handler_service_1.ConflictError('Email already exists');
            expect(error.statusCode).toBe(409);
            expect(error.message).toBe('Email already exists');
        });
        it('should create ValidationError with correct status', () => {
            const error = new error_handler_service_1.ValidationError('Invalid email format');
            expect(error.statusCode).toBe(422);
            expect(error.message).toBe('Invalid email format');
        });
        it('should create InternalServerError with correct status', () => {
            const error = new error_handler_service_1.InternalServerError('Database connection failed');
            expect(error.statusCode).toBe(500);
            expect(error.message).toBe('Database connection failed');
            expect(error.isOperational).toBe(false);
        });
        it('should create ServiceUnavailableError with correct status', () => {
            const error = new error_handler_service_1.ServiceUnavailableError('Service temporarily down');
            expect(error.statusCode).toBe(503);
            expect(error.message).toBe('Service temporarily down');
        });
        it('should include error code and details', () => {
            const error = new error_handler_service_1.BadRequestError('Validation failed', 'VALIDATION_ERROR', { field: 'email', reason: 'invalid format' });
            expect(error.code).toBe('VALIDATION_ERROR');
            expect(error.details).toEqual({ field: 'email', reason: 'invalid format' });
        });
    });
    describe('validateRequired', () => {
        it('should not throw when all required fields are present', () => {
            const fields = { email: 'test@example.com', password: 'password123' };
            expect(() => {
                error_handler_service_1.ErrorHandlerService.validateRequired(fields, ['email', 'password']);
            }).not.toThrow();
        });
        it('should throw BadRequestError when required field is missing', () => {
            const fields = { email: 'test@example.com' };
            expect(() => {
                error_handler_service_1.ErrorHandlerService.validateRequired(fields, ['email', 'password']);
            }).toThrow(error_handler_service_1.BadRequestError);
        });
        it('should list all missing fields in error message', () => {
            const fields = { email: 'test@example.com' };
            try {
                error_handler_service_1.ErrorHandlerService.validateRequired(fields, ['email', 'password', 'firstName']);
            }
            catch (error) {
                expect(error.message).toContain('password');
                expect(error.message).toContain('firstName');
                expect(error.details.missingFields).toEqual(['password', 'firstName']);
            }
        });
    });
    describe('validateField', () => {
        it('should not throw when field has value', () => {
            expect(() => {
                error_handler_service_1.ErrorHandlerService.validateField('test@example.com', 'email');
            }).not.toThrow();
        });
        it('should throw BadRequestError when field is missing', () => {
            expect(() => {
                error_handler_service_1.ErrorHandlerService.validateField(undefined, 'email');
            }).toThrow(error_handler_service_1.BadRequestError);
        });
        it('should include field name in error', () => {
            try {
                error_handler_service_1.ErrorHandlerService.validateField(null, 'password');
            }
            catch (error) {
                expect(error.message).toContain('password');
                expect(error.details.field).toBe('password');
            }
        });
    });
    describe('Helper Methods', () => {
        it('should create authentication error', () => {
            const error = error_handler_service_1.ErrorHandlerService.authenticationError();
            expect(error).toBeInstanceOf(error_handler_service_1.UnauthorizedError);
            expect(error.code).toBe('AUTH_REQUIRED');
        });
        it('should create invalid credentials error', () => {
            const error = error_handler_service_1.ErrorHandlerService.invalidCredentials();
            expect(error).toBeInstanceOf(error_handler_service_1.UnauthorizedError);
            expect(error.message).toBe('Invalid credentials');
            expect(error.code).toBe('INVALID_CREDENTIALS');
        });
        it('should create invalid token error', () => {
            const error = error_handler_service_1.ErrorHandlerService.invalidToken();
            expect(error).toBeInstanceOf(error_handler_service_1.UnauthorizedError);
            expect(error.code).toBe('INVALID_TOKEN');
        });
        it('should create not found error', () => {
            const error = error_handler_service_1.ErrorHandlerService.notFound('User');
            expect(error).toBeInstanceOf(error_handler_service_1.NotFoundError);
            expect(error.message).toBe('User not found');
            expect(error.details.resource).toBe('User');
        });
        it('should create already exists error', () => {
            const error = error_handler_service_1.ErrorHandlerService.alreadyExists('User');
            expect(error).toBeInstanceOf(error_handler_service_1.ConflictError);
            expect(error.message).toBe('User already exists');
            expect(error.details.resource).toBe('User');
        });
        it('should create forbidden error', () => {
            const error = error_handler_service_1.ErrorHandlerService.forbidden();
            expect(error).toBeInstanceOf(error_handler_service_1.ForbiddenError);
            expect(error.code).toBe('FORBIDDEN');
        });
        it('should create validation error', () => {
            const error = error_handler_service_1.ErrorHandlerService.validation('Invalid email', { field: 'email' });
            expect(error).toBeInstanceOf(error_handler_service_1.ValidationError);
            expect(error.message).toBe('Invalid email');
            expect(error.details.field).toBe('email');
        });
    });
    describe('handleError', () => {
        let mockCtx;
        beforeEach(() => {
            mockCtx = {
                status: 200,
                body: {},
            };
        });
        it('should handle AppError correctly', () => {
            const error = new error_handler_service_1.BadRequestError('Invalid input', 'INVALID_INPUT', { field: 'email' });
            error_handler_service_1.ErrorHandlerService.handleError(mockCtx, error);
            expect(mockCtx.status).toBe(400);
            expect(mockCtx.body).toEqual({
                error: 'Invalid input',
                code: 'INVALID_INPUT',
                details: { field: 'email' },
            });
        });
        it('should handle unknown errors as 500', () => {
            const error = new Error('Something went wrong');
            error_handler_service_1.ErrorHandlerService.handleError(mockCtx, error);
            expect(mockCtx.status).toBe(500);
            expect(mockCtx.body).toEqual({
                error: 'Internal Server Error',
            });
        });
        it('should handle NotFoundError', () => {
            const error = new error_handler_service_1.NotFoundError('Hotel not found');
            error_handler_service_1.ErrorHandlerService.handleError(mockCtx, error);
            expect(mockCtx.status).toBe(404);
            expect(mockCtx.body.error).toBe('Hotel not found');
        });
        it('should handle UnauthorizedError', () => {
            const error = new error_handler_service_1.UnauthorizedError('Invalid token');
            error_handler_service_1.ErrorHandlerService.handleError(mockCtx, error);
            expect(mockCtx.status).toBe(401);
            expect(mockCtx.body.error).toBe('Invalid token');
        });
    });
    describe('asyncHandler', () => {
        it('should execute handler successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockCtx = { status: 200, body: {} };
            const handler = error_handler_service_1.ErrorHandlerService.asyncHandler((ctx) => __awaiter(void 0, void 0, void 0, function* () {
                ctx.body = { success: true };
            }));
            yield handler(mockCtx);
            expect(mockCtx.body).toEqual({ success: true });
        }));
        it('should catch and handle errors', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockCtx = { status: 200, body: {} };
            const handler = error_handler_service_1.ErrorHandlerService.asyncHandler((ctx) => __awaiter(void 0, void 0, void 0, function* () {
                throw new error_handler_service_1.BadRequestError('Invalid request');
            }));
            yield handler(mockCtx);
            expect(mockCtx.status).toBe(400);
            expect(mockCtx.body.error).toBe('Invalid request');
        }));
    });
});
