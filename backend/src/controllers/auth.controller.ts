import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '@/config/environment';
import { logger } from '@/utils/logger';
import { createError, asyncHandler } from '@/middleware/errorHandler';
import { AuthenticatedRequest, LoginRequest, RegisterRequest, ApiResponse, AuthResponse } from '@/types/api';
// Import user service when implemented
// import { UserService } from '@/services/user.service';

export class AuthController {
  // Register new user
  static register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, firstName, lastName, role }: RegisterRequest = req.body;

    // Check if user already exists
    // const existingUser = await UserService.findByEmail(email);
    // if (existingUser) {
    //   throw createError('User already exists with this email', 409);
    // }

    // Hash password
    const saltRounds = config.security.bcryptRounds;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    // const newUser = await UserService.create({
    //   email,
    //   password: hashedPassword,
    //   firstName,
    //   lastName,
    //   role,
    // });

    // For now, create a mock user response
    const mockUser = {
      id: '1',
      email,
      firstName,
      lastName,
      role,
      phone: '',
      location: '',
      skills: [],
      resumeUploaded: false,
      profileComplete: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Generate tokens
    const token = jwt.sign(
      { 
        userId: mockUser.id, 
        email: mockUser.email, 
        role: mockUser.role 
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expire }
    );

    const refreshToken = jwt.sign(
      { 
        userId: mockUser.id, 
        email: mockUser.email, 
        role: mockUser.role 
      },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpire }
    );

    logger.info(`User registered successfully: ${email}`);

    const response: ApiResponse<AuthResponse> = {
      success: true,
      data: {
        user: mockUser,
        token,
        refreshToken,
      },
      message: 'User registered successfully',
    };

    res.status(201).json(response);
  });

  // Login user
  static login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password }: LoginRequest = req.body;

    // Find user by email
    // const user = await UserService.findByEmail(email);
    // if (!user) {
    //   throw createError('Invalid credentials', 401);
    // }

    // For now, create a mock user for demo
    const mockUser = {
      id: '1',
      email,
      firstName: 'Demo',
      lastName: 'User',
      role: 'job_seeker' as const,
      phone: '',
      location: '',
      skills: [],
      resumeUploaded: false,
      profileComplete: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      password: await bcrypt.hash('password123', 12), // Demo password
    };

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, mockUser.password);
    if (!isPasswordValid) {
      throw createError('Invalid credentials', 401);
    }

    // Generate tokens
    const token = jwt.sign(
      { 
        userId: mockUser.id, 
        email: mockUser.email, 
        role: mockUser.role 
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expire }
    );

    const refreshToken = jwt.sign(
      { 
        userId: mockUser.id, 
        email: mockUser.email, 
        role: mockUser.role 
      },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpire }
    );

    logger.info(`User logged in successfully: ${email}`);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = mockUser;

    const response: ApiResponse<AuthResponse> = {
      success: true,
      data: {
        user: userWithoutPassword,
        token,
        refreshToken,
      },
      message: 'Login successful',
    };

    res.json(response);
  });

  // Logout user
  static logout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // In a real implementation, you might want to blacklist the token
    // For now, just log the logout event
    
    logger.info(`User logged out: ${req.user?.email}`);

    const response: ApiResponse = {
      success: true,
      message: 'Logged out successfully',
    };

    res.json(response);
  });

  // Refresh token
  static refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw createError('Refresh token is required', 400);
    }

    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as any;
      
      // Generate new access token
      const newToken = jwt.sign(
        { 
          userId: decoded.userId, 
          email: decoded.email, 
          role: decoded.role 
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expire }
      );

      const response: ApiResponse<{ token: string }> = {
        success: true,
        data: { token: newToken },
        message: 'Token refreshed successfully',
      };

      res.json(response);
    } catch (error) {
      throw createError('Invalid refresh token', 401);
    }
  });

  // Get current user profile
  static getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw createError('User not found', 404);
    }

    const response: ApiResponse = {
      success: true,
      data: req.user,
      message: 'Profile retrieved successfully',
    };

    res.json(response);
  });

  // Forgot password
  static forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    // Find user by email
    // const user = await UserService.findByEmail(email);
    // if (!user) {
    //   // Don't reveal if email exists or not for security
    //   return res.json({
    //     success: true,
    //     message: 'If an account with that email exists, we have sent a password reset link.',
    //   });
    // }

    // Generate reset token
    const resetToken = jwt.sign(
      { email },
      config.jwt.secret,
      { expiresIn: '1h' }
    );

    // Send reset email (implement email service)
    // await EmailService.sendPasswordResetEmail(email, resetToken);

    logger.info(`Password reset requested for: ${email}`);

    const response: ApiResponse = {
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link.',
    };

    res.json(response);
  });

  // Reset password
  static resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, config.security.bcryptRounds);

      // Update user password
      // await UserService.updatePassword(decoded.email, hashedPassword);

      logger.info(`Password reset successfully for: ${decoded.email}`);

      const response: ApiResponse = {
        success: true,
        message: 'Password reset successfully',
      };

      res.json(response);
    } catch (error) {
      throw createError('Invalid or expired reset token', 400);
    }
  });
}
