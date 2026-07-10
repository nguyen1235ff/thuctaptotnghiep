import { api } from './api';

// =========================================================
// USER INFO - khớp với UserResponse.java từ Backend
// =========================================================
export interface UserInfo {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  address: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  roles: string[]; // Backend trả về ["ADMIN"], ["CUSTOMER"], ["RESTAURANT"], ["SHIPPER"]
  createdAt: string;
  updatedAt: string;
}

// =========================================================
// AUTH RESPONSE - khớp với AuthResponse.java từ Backend
// =========================================================
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserInfo;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  fullName: string;
  phone: string;
  roleName?: string; // "CUSTOMER" | "RESTAURANT" (optional, default CUSTOMER)
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<any> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/reset-password', data);
    return response.data;
  }
};