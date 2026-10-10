export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  companyName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  normalizedEmail?: string;
  authProvider?: string;
  providerId?: string | null;
  organizationId?: string | null;
  role: string;
  isEmailVerified: boolean;
  isActive: boolean;
  company?: string;
  companyName?: string;
  jobTitle?: string;
  avatar?: string;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponseData {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: AuthResponseData;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: AuthResponseData;
}

export interface ApiErrorDetail {
  field?: string;
  message?: string;
}

export interface ApiErrorResponse {
  success: boolean;
  message: string;
  error?: {
    code?: string;
    details?: ApiErrorDetail[];
  };
}
