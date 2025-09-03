import { Request } from 'express';
import { User } from './models';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'job_seeker' | 'recruiter';
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
  refreshToken: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface FileUploadRequest {
  fieldName: string;
  maxSize: number;
  allowedTypes: string[];
  required?: boolean;
}

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}

export interface JobSearchQuery {
  query?: string;
  location?: string;
  experienceLevel?: string[];
  skills?: string[];
  isRemote?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  company?: string;
}

export interface AnalyticsQuery {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
  userId?: string;
}

export interface SkillGapAnalysisRequest {
  resumeId: string;
  jobId: string;
}

export interface CoverLetterRequest {
  jobId: string;
  additionalInfo?: string;
}

export interface ColdEmailRequest {
  companyName: string;
  recipientName?: string;
  position: string;
  additionalInfo?: string;
}
