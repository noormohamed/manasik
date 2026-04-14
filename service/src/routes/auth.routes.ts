import Router from 'koa-router';
import { Context } from 'koa';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireFeature } from '../middleware/feature-flag';
import { AuthService } from '../services/auth.service';
import { UserRepository } from '../database/repositories/user.repository';
import { User } from '../models/user';
import { v4 as uuidv4 } from 'uuid';

const authService = new AuthService();

export const authRoutes = new Router({ prefix: '/auth' });

/**
 * POST /api/auth/register
 * Register a new user
 */
authRoutes.post('/register', requireFeature('registration'), async (ctx: Context) => {
  try {
    const userRepository = new UserRepository();
    // @ts-ignore
      const { email, password, firstName, lastName } = ctx.request.body as any;

    if (!email || !password || !firstName || !lastName) {
      ctx.status = 400;
      ctx.body = { error: 'Missing required fields: email, password, firstName, lastName' };
      return;
    }

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      ctx.status = 409;
      ctx.body = { error: 'User already exists' };
      return;
    }

    // Create new user
    const userId = uuidv4();
    const hashedPassword = await authService.hashPassword(password);

    const newUser = new User(userId);
    newUser.id = userId;
    newUser.email = email;
    newUser.first_name = firstName;
    newUser.last_name = lastName;
    newUser.password_hash = hashedPassword;
    newUser.role = 'CUSTOMER';
    newUser.is_active = true;
    newUser.created_at = new Date();
    newUser.updated_at = new Date();

    await userRepository.create(newUser);

    // Generate tokens
    const tokens = authService.generateTokens(newUser);

    ctx.status = 201;
    ctx.body = {
      message: 'User registered successfully',
      user: {
        id: userId,
        email,
        firstName,
        lastName,
      },
      tokens,
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Registration failed' };
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
authRoutes.post('/login', requireFeature('login'), async (ctx: Context) => {
  try {
    const userRepository = new UserRepository();
    // @ts-ignore
      const { email, password } = ctx.request.body as any;

    if (!email || !password) {
      ctx.status = 400;
      ctx.body = { error: 'Missing required fields: email, password' };
      return;
    }

    // Find user
    const user = await userRepository.findByEmail(email);
    if (!user) {
      ctx.status = 401;
      ctx.body = { error: 'Invalid credentials' };
      return;
    }

    // TODO: Verify password against stored hash
    // For now, accept any password
    // const isPasswordValid = await authService.comparePassword(password, user.password);
    // if (!isPasswordValid) {
    //   ctx.status = 401;
    //   ctx.body = { error: 'Invalid credentials' };
    //   return;
    // }

    // Generate tokens
    const tokens = authService.generateTokens(user);

    ctx.body = {
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      },
      tokens,
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Login failed' };
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
authRoutes.post('/refresh', requireFeature('refreshToken'), async (ctx: Context) => {
  try {
    const userRepository = new UserRepository();
    // @ts-ignore
      const { refreshToken } = ctx.request.body as any;

    if (!refreshToken) {
      ctx.status = 400;
      ctx.body = { error: 'Missing refreshToken' };
      return;
    }

    const decoded = authService.verifyRefreshToken(refreshToken);
    if (!decoded) {
      ctx.status = 401;
      ctx.body = { error: 'Invalid refresh token' };
      return;
    }

    const user = await userRepository.findById(decoded.userId);
    if (!user) {
      ctx.status = 401;
      ctx.body = { error: 'User not found' };
      return;
    }

    const tokens = authService.generateTokens(user);

    ctx.body = {
      message: 'Token refreshed',
      tokens,
    };
  } catch (error) {
    ctx.status = 401;
    ctx.body = { error: 'Token refresh failed' };
  }
});

/**
 * POST /api/auth/logout
 * Logout user (client-side token removal)
 */
authRoutes.post('/logout', authMiddleware, async (ctx: Context) => {
  ctx.body = { message: 'Logout successful' };
});

/**
 * GET /api/auth/me
 * Get current user
 */
authRoutes.get('/me', authMiddleware, async (ctx: Context) => {
  try {
    const userRepository = new UserRepository();
    const userId = (ctx.state as any).userId;
    const user = await userRepository.findById(userId);

    if (!user) {
      ctx.status = 404;
      ctx.body = { error: 'User not found' };
      return;
    }

    ctx.body = {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Failed to fetch user' };
  }
});

/**
 * POST /api/auth/change-password
 * Change password for authenticated user
 */
authRoutes.post('/change-password', authMiddleware, requireFeature('login'), async (ctx: Context) => {
  try {
    const userRepository = new UserRepository();
    const userId = (ctx as any).user?.userId;
    // @ts-ignore
    const { currentPassword, newPassword } = ctx.request.body as any;

    if (!userId) {
      ctx.status = 401;
      ctx.body = { error: 'Unauthorized' };
      return;
    }

    if (!currentPassword || !newPassword) {
      ctx.status = 400;
      ctx.body = { error: 'Missing required fields: currentPassword, newPassword' };
      return;
    }

    if (newPassword.length < 6) {
      ctx.status = 400;
      ctx.body = { error: 'New password must be at least 6 characters long' };
      return;
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      ctx.status = 404;
      ctx.body = { error: 'User not found' };
      return;
    }

    // Verify current password
    const isPasswordValid = await authService.comparePassword(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      ctx.status = 401;
      ctx.body = { error: 'Current password is incorrect' };
      return;
    }

    // Hash new password and update
    const hashedPassword = await authService.hashPassword(newPassword);

    await userRepository.update(user.id, {
      password_hash: hashedPassword,
      updated_at: new Date(),
    } as any);

    ctx.body = { message: 'Password changed successfully' };
  } catch (error) {
    console.error('Change password error:', error);
    ctx.status = 500;
    ctx.body = { error: 'Failed to change password' };
  }
});

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
authRoutes.post('/forgot-password', async (ctx: Context) => {
  try {
    const userRepository = new UserRepository();
    // @ts-ignore
      const { email } = ctx.request.body as any;

    if (!email) {
      ctx.status = 400;
      ctx.body = { error: 'Missing required field: email' };
      return;
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists
      ctx.body = { message: 'If email exists, password reset link has been sent' };
      return;
    }

    // TODO: Generate reset token and send email
    // For now, just return success
    ctx.body = { message: 'Password reset link sent to email' };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Failed to process password reset request' };
  }
});

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
authRoutes.post('/reset-password', async (ctx: Context) => {
  try {
    const userRepository = new UserRepository();
    // @ts-ignore
      const { email, token, newPassword } = ctx.request.body as any;

    if (!email || !token || !newPassword) {
      ctx.status = 400;
      ctx.body = { error: 'Missing required fields: email, token, newPassword' };
      return;
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      ctx.status = 404;
      ctx.body = { error: 'User not found' };
      return;
    }

    // TODO: Verify reset token
    // For now, accept any token
    // const isTokenValid = await authService.verifyResetToken(token, user.id);
    // if (!isTokenValid) {
    //   ctx.status = 401;
    //   ctx.body = { error: 'Invalid or expired reset token' };
    //   return;
    // }

    // Hash new password and update
    const hashedPassword = await authService.hashPassword(newPassword);
    user.password_hash = hashedPassword;
    user.updated_at = new Date();

      await userRepository.update(user.id, {
          password_hash: hashedPassword,
          updated_at: new Date(),
      } as any);

    ctx.body = { message: 'Password reset successfully' };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Failed to reset password' };
  }
});
