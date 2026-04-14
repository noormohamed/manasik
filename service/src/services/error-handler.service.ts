/**
 * Error Handler Service
 * Centralized error handling with custom error classes and consistent responses
 */

import { Context } from 'koa';

/**
 * Base Application Error
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string,
    details?: any
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);

    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    this.details = details;

    Error.captureStackTrace(this);
  }
}

/**
 * 400 Bad Request
 */
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad Request', code?: string, details?: any) {
    super(message, 400, true, code, details);
  }
}

/**
 * 401 Unauthorized
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', code?: string, details?: any) {
    super(message, 401, true, code, details);
  }
}

/**
 * 403 Forbidden
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', code?: string, details?: any) {
    super(message, 403, true, code, details);
  }
}

/**
 * 404 Not Found
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', code?: string, details?: any) {
    super(message, 404, true, code, details);
  }
}

/**
 * 409 Conflict
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Conflict', code?: string, details?: any) {
    super(message, 409, true, code, details);
  }
}

/**
 * 422 Unprocessable Entity
 */
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', code?: string, details?: any) {
    super(message, 422, true, code, details);
  }
}

/**
 * 500 Internal Server Error
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Internal Server Error', code?: string, details?: any) {
    super(message, 500, false, code, details);
  }
}

/**
 * 503 Service Unavailable
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service Unavailable', code?: string, details?: any) {
    super(message, 503, true, code, details);
  }
}

/**
 * Error Handler Service
 */
export class ErrorHandlerService {
  /**
   * Handle error and set appropriate response
   */
  static handleError(ctx: Context, error: Error | AppError): void {
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
    } else {
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
  static validateRequired(fields: Record<string, any>, requiredFields: string[]): void {
    const missing = requiredFields.filter(field => !fields[field]);
    
    if (missing.length > 0) {
      throw new BadRequestError(
        `Missing required fields: ${missing.join(', ')}`,
        'MISSING_FIELDS',
        { missingFields: missing }
      );
    }
  }

  /**
   * Validate single required field
   */
  static validateField(value: any, fieldName: string): void {
    if (!value) {
      throw new BadRequestError(
        `Missing required field: ${fieldName}`,
        'MISSING_FIELD',
        { field: fieldName }
      );
    }
  }

  /**
   * Create authentication error
   */
  static authenticationError(message: string = 'Authentication required'): UnauthorizedError {
    return new UnauthorizedError(message, 'AUTH_REQUIRED');
  }

  /**
   * Create invalid credentials error
   */
  static invalidCredentials(): UnauthorizedError {
    return new UnauthorizedError('Invalid credentials', 'INVALID_CREDENTIALS');
  }

  /**
   * Create invalid token error
   */
  static invalidToken(message: string = 'Invalid or expired token'): UnauthorizedError {
    return new UnauthorizedError(message, 'INVALID_TOKEN');
  }

  /**
   * Create resource not found error
   */
  static notFound(resource: string): NotFoundError {
    return new NotFoundError(`${resource} not found`, 'NOT_FOUND', { resource });
  }

  /**
   * Create already exists error
   */
  static alreadyExists(resource: string): ConflictError {
    return new ConflictError(`${resource} already exists`, 'ALREADY_EXISTS', { resource });
  }

  /**
   * Create forbidden error
   */
  static forbidden(message: string = 'You do not have permission to perform this action'): ForbiddenError {
    return new ForbiddenError(message, 'FORBIDDEN');
  }

  /**
   * Create validation error
   */
  static validation(message: string, details?: any): ValidationError {
    return new ValidationError(message, 'VALIDATION_ERROR', details);
  }

  /**
   * Wrap async route handler with error handling
   */
  static asyncHandler(fn: (ctx: Context) => Promise<void>) {
    return async (ctx: Context) => {
      try {
        await fn(ctx);
      } catch (error) {
        ErrorHandlerService.handleError(ctx, error as Error);
      }
    };
  }
}

// Export singleton instance
export const errorHandler = ErrorHandlerService;
