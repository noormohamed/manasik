"use strict";
/**
 * Error Handler Service
 * Centralized error handling with custom error classes and consistent responses
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
exports.errorHandler = exports.ErrorHandlerService = exports.ServiceUnavailableError = exports.InternalServerError = exports.ValidationError = exports.ConflictError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.BadRequestError = exports.AppError = void 0;
/**
 * Base Application Error
 */
class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true, code, details) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.code = code;
        this.details = details;
        Error.captureStackTrace(this);
    }
}
exports.AppError = AppError;
/**
 * 400 Bad Request
 */
class BadRequestError extends AppError {
    constructor(message = 'Bad Request', code, details) {
        super(message, 400, true, code, details);
    }
}
exports.BadRequestError = BadRequestError;
/**
 * 401 Unauthorized
 */
class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized', code, details) {
        super(message, 401, true, code, details);
    }
}
exports.UnauthorizedError = UnauthorizedError;
/**
 * 403 Forbidden
 */
class ForbiddenError extends AppError {
    constructor(message = 'Forbidden', code, details) {
        super(message, 403, true, code, details);
    }
}
exports.ForbiddenError = ForbiddenError;
/**
 * 404 Not Found
 */
class NotFoundError extends AppError {
    constructor(message = 'Resource not found', code, details) {
        super(message, 404, true, code, details);
    }
}
exports.NotFoundError = NotFoundError;
/**
 * 409 Conflict
 */
class ConflictError extends AppError {
    constructor(message = 'Conflict', code, details) {
        super(message, 409, true, code, details);
    }
}
exports.ConflictError = ConflictError;
/**
 * 422 Unprocessable Entity
 */
class ValidationError extends AppError {
    constructor(message = 'Validation failed', code, details) {
        super(message, 422, true, code, details);
    }
}
exports.ValidationError = ValidationError;
/**
 * 500 Internal Server Error
 */
class InternalServerError extends AppError {
    constructor(message = 'Internal Server Error', code, details) {
        super(message, 500, false, code, details);
    }
}
exports.InternalServerError = InternalServerError;
/**
 * 503 Service Unavailable
 */
class ServiceUnavailableError extends AppError {
    constructor(message = 'Service Unavailable', code, details) {
        super(message, 503, true, code, details);
    }
}
exports.ServiceUnavailableError = ServiceUnavailableError;
/**
 * Error Handler Service
 */
class ErrorHandlerService {
    /**
     * Handle error and set appropriate response
     */
    static handleError(ctx, error) {
        if (error instanceof AppError) {
            ctx.status = error.statusCode;
            ctx.body = {
                error: error.message,
                code: error.code,
                details: error.details,
            };
            // Log operational errors at info level, programming errors at error level
            if (!error.isOperational) {
                console.error('Non-operational error:', error);
            }
        }
        else {
            // Unknown error - treat as internal server error
            ctx.status = 500;
            ctx.body = {
                error: 'Internal Server Error',
            };
            console.error('Unexpected error:', error);
        }
    }
    /**
     * Validate required fields
     */
    static validateRequired(fields, requiredFields) {
        const missing = requiredFields.filter(field => !fields[field]);
        if (missing.length > 0) {
            throw new BadRequestError(`Missing required fields: ${missing.join(', ')}`, 'MISSING_FIELDS', { missingFields: missing });
        }
    }
    /**
     * Validate single required field
     */
    static validateField(value, fieldName) {
        if (!value) {
            throw new BadRequestError(`Missing required field: ${fieldName}`, 'MISSING_FIELD', { field: fieldName });
        }
    }
    /**
     * Create authentication error
     */
    static authenticationError(message = 'Authentication required') {
        return new UnauthorizedError(message, 'AUTH_REQUIRED');
    }
    /**
     * Create invalid credentials error
     */
    static invalidCredentials() {
        return new UnauthorizedError('Invalid credentials', 'INVALID_CREDENTIALS');
    }
    /**
     * Create invalid token error
     */
    static invalidToken(message = 'Invalid or expired token') {
        return new UnauthorizedError(message, 'INVALID_TOKEN');
    }
    /**
     * Create resource not found error
     */
    static notFound(resource) {
        return new NotFoundError(`${resource} not found`, 'NOT_FOUND', { resource });
    }
    /**
     * Create already exists error
     */
    static alreadyExists(resource) {
        return new ConflictError(`${resource} already exists`, 'ALREADY_EXISTS', { resource });
    }
    /**
     * Create forbidden error
     */
    static forbidden(message = 'You do not have permission to perform this action') {
        return new ForbiddenError(message, 'FORBIDDEN');
    }
    /**
     * Create validation error
     */
    static validation(message, details) {
        return new ValidationError(message, 'VALIDATION_ERROR', details);
    }
    /**
     * Wrap async route handler with error handling
     */
    static asyncHandler(fn) {
        return (ctx) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield fn(ctx);
            }
            catch (error) {
                ErrorHandlerService.handleError(ctx, error);
            }
        });
    }
}
exports.ErrorHandlerService = ErrorHandlerService;
// Export singleton instance
exports.errorHandler = ErrorHandlerService;
