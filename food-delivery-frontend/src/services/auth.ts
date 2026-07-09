import { api } from './api';

// Định nghĩa interface dựa theo LoginRequest.java
export interface LoginRequest {
  username: string;
  password: string;
}

// Cấu trúc dữ liệu nhận về từ API /auth/login (Chứa JWT Token)
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  username: string;
  roles: string[];
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  fullName: string;
  phone: string;
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
  // Đăng nhập hệ thống - POST: /auth/login
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  // Đăng ký tài khoản - POST: /auth/register
  register: async (data: RegisterRequest): Promise<any> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Quên mật khẩu - POST: /auth/forgot-password
  forgotPassword: async (data: ForgotPasswordRequest): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/forgot-password', data);
    return response.data;
  },

  // Đặt lại mật khẩu mới - POST: /auth/reset-password
  resetPassword: async (data: ResetPasswordRequest): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/reset-password', data);
    return response.data;
  }
};