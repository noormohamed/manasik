/**
 * Error Handler Service Tests
 */

import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  InternalServerError,
  ServiceUnavailableError,
  ErrorHandlerService,
} from '../services/error-handler.service';

describe('Error Handler Service', () => {
  describe('Custom Error Classes', () => {
    it('should create BadRequestError with correct status', () => {
      const error = new BadRequestError('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Invalid input');
      expect(error.isOperational).toBe(true);
    });

    it('should create UnauthorizedError with correct status', () => {
      const error = new UnauthorizedError('Not authenticated');
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Not authenticated');
    });

    it('should create ForbiddenError with correct status', () => {
      const error = new ForbiddenError('Access denied');
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('Access denied');
    });

    it('should create NotFoundError with correct status', () => {
      const error = new NotFoundError('User not found');
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('User not found');
    });

    it('should create ConflictError with correct status', () => {
      const error = new ConflictError('Email already exists');
      expect(error.statusCode).toBe(409);
      expect(error.message).toBe('Email already exists');
    });

    it('should create ValidationError with correct status', () => {
      const error = new ValidationError('Invalid email format');
      expect(error.statusCode).toBe(422);
      expect(error.message).toBe('Invalid email format');
    });

    it('should create InternalServerError with correct status', () => {
      const error = new InternalServerError('Database connection failed');
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('Database connection failed');
      expect(error.isOperational).toBe(false);
    });

    it('should create ServiceUnavailableError with correct status', () => {
      const error = new ServiceUnavailableError('Service temporarily down');
      expect(error.statusCode).toBe(503);
      expect(error.message).toBe('Service temporarily down');
    });

    it('should include error code and details', () => {
      const error = new BadRequestError(
        'Validation failed',
        'VALIDATION_ERROR',
        { field: 'email', reason: 'invalid format' }
      );
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.details).toEqual({ field: 'email', reason: 'invalid format' });
    });
  });

  describe('validateRequired', () => {
    it('should not throw when all required fields are present', () => {
      const fields = { email: 'test@example.com', password: 'password123' };
      expect(() => {
        ErrorHandlerService.validateRequired(fields, ['email', 'password']);
      }).not.toThrow();
    });

    it('should throw BadRequestError when required field is missing', () => {
      const fields = { email: 'test@example.com' };
      expect(() => {
        ErrorHandlerService.validateRequired(fields, ['email', 'password']);
      }).toThrow(BadRequestError);
    });

    it('should list all missing fields in error message', () => {
      const fields = { email: 'test@example.com' };
      try {
        ErrorHandlerService.validateRequired(fields, ['email', 'password', 'firstName']);
      } catch (error: any) {
        expect(error.message).toContain('password');
        expect(error.message).toContain('firstName');
        expect(error.details.missingFields).toEqual(['password', 'firstName']);
      }
    });
  });

  describe('validateField', () => {
    it('should not throw when field has value', () => {
      expect(() => {
        ErrorHandlerService.validateField('test@example.com', 'email');
      }).not.toThrow();
    });

    it('should throw BadRequestError when field is missing', () => {
      expect(() => {
        ErrorHandlerService.validateField(undefined, 'email');
      }).toThrow(BadRequestError);
    });

    it('should include field name in error', () => {
      try {
        ErrorHandlerService.validateField(null, 'password');
      } catch (error: any) {
        expect(error.message).toContain('password');
        expect(error.details.field).toBe('password');
      }
    });
  });

  describe('Helper Methods', () => {
    it('should create authentication error', () => {
      const error = ErrorHandlerService.authenticationError();
      expect(error).toBeInstanceOf(UnauthorizedError);
      expect(error.code).toBe('AUTH_REQUIRED');
    });

    it('should create invalid credentials error', () => {
      const error = ErrorHandlerService.invalidCredentials();
      expect(error).toBeInstanceOf(UnauthorizedError);
      expect(error.message).toBe('Invalid credentials');
      expect(error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should create invalid token error', () => {
      const error = ErrorHandlerService.invalidToken();
      expect(error).toBeInstanceOf(UnauthorizedError);
      expect(error.code).toBe('INVALID_TOKEN');
    });

    it('should create not found error', () => {
      const error = ErrorHandlerService.notFound('User');
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.message).toBe('User not found');
      expect(error.details.resource).toBe('User');
    });

    it('should create already exists error', () => {
      const error = ErrorHandlerService.alreadyExists('User');
      expect(error).toBeInstanceOf(ConflictError);
      expect(error.message).toBe('User already exists');
      expect(error.details.resource).toBe('User');
    });

    it('should create forbidden error', () => {
      const error = ErrorHandlerService.forbidden();
      expect(error).toBeInstanceOf(ForbiddenError);
      expect(error.code).toBe('FORBIDDEN');
    });

    it('should create validation error', () => {
      const error = ErrorHandlerService.validation('Invalid email', { field: 'email' });
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe('Invalid email');
      expect(error.details.field).toBe('email');
    });
  });

  describe('handleError', () => {
    let mockCtx: any;

    beforeEach(() => {
      mockCtx = {
        status: 200,
        body: {},
      };
    });

    it('should handle AppError correctly', () => {
      const error = new BadRequestError('Invalid input', 'INVALID_INPUT', { field: 'email' });
      ErrorHandlerService.handleError(mockCtx, error);

      expect(mockCtx.status).toBe(400);
      expect(mockCtx.body).toEqual({
        error: 'Invalid input',
        code: 'INVALID_INPUT',
        details: { field: 'email' },
      });
    });

    it('should handle unknown errors as 500', () => {
      const error = new Error('Something went wrong');
      ErrorHandlerService.handleError(mockCtx, error);

      expect(mockCtx.status).toBe(500);
      expect(mockCtx.body).toEqual({
        error: 'Internal Server Error',
      });
    });

    it('should handle NotFoundError', () => {
      const error = new NotFoundError('Hotel not found');
      ErrorHandlerService.handleError(mockCtx, error);

      expect(mockCtx.status).toBe(404);
      expect(mockCtx.body.error).toBe('Hotel not found');
    });

    it('should handle UnauthorizedError', () => {
      const error = new UnauthorizedError('Invalid token');
      ErrorHandlerService.handleError(mockCtx, error);

      expect(mockCtx.status).toBe(401);
      expect(mockCtx.body.error).toBe('Invalid token');
    });
  });

  describe('asyncHandler', () => {
    it('should execute handler successfully', async () => {
      const mockCtx: any = { status: 200, body: {} };
      const handler = ErrorHandlerService.asyncHandler(async (ctx) => {
        ctx.body = { success: true };
      });

      await handler(mockCtx);
      expect(mockCtx.body).toEqual({ success: true });
    });

    it('should catch and handle errors', async () => {
      const mockCtx: any = { status: 200, body: {} };
      const handler = ErrorHandlerService.asyncHandler(async (ctx) => {
        throw new BadRequestError('Invalid request');
      });

      await handler(mockCtx);
      expect(mockCtx.status).toBe(400);
      expect(mockCtx.body.error).toBe('Invalid request');
    });
  });
});
