export interface UserItem {
  id: string;
  name: string;
  email: string;
  normalizedEmail?: string;
  role: string;
  authProvider?: string;
  providerId?: string | null;
  organizationId?: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string | null;
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetUsersParams {
  k?: string;
  page?: number;
  limit?: number;
  signal?: AbortSignal;
}

export interface GetUsersResponseData {
  users: UserItem[];
  pagination: PaginationMetadata;
}

export interface GetUsersResponse {
  success: boolean;
  message: string;
  data: GetUsersResponseData;
}
