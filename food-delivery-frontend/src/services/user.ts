import { api } from './api';
import type { PageResponse } from './voucher'; // Cấu trúc phân trang PageResponse { content: T[], totalPages: number, ... }

// Ánh xạ chính xác cấu trúc dữ liệu phản hồi từ UserResponse của Backend
export interface UserResponse {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
  isActive: boolean;
}

// Interface truyền vào khi đổi mật khẩu (khớp ChangePasswordRequest.java)
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

// Interface truyền vào khi cập nhật thông tin cá nhân (khớp UpdateProfileRequest.java)
export interface UpdateProfileRequest {
  fullName: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
}

export const userService = {
  // ==========================================
  // 1. DÀNH CHO ADMIN (AdminController)
  // ==========================================

  // Lấy toàn bộ danh sách người dùng hệ thống (Phân trang) - GET: /admin/users
  getAllUsersAdmin: async (page = 0, size = 20): Promise<PageResponse<UserResponse>> => {
    const response = await api.get<PageResponse<UserResponse>>('/admin/users', {
      params: { page, size }
    });
    return response.data;
  },

  // Bật/Tắt trạng thái hoạt động của tài khoản người dùng - PUT: /admin/users/{id}/active?active=true/false
  toggleUserActive: async (id: number, active: boolean): Promise<UserResponse> => {
    const response = await api.put<UserResponse>(`/admin/users/${id}/active`, null, {
      params: { active }
    });
    return response.data;
  },

  // ==========================================
  // 2. DÀNH CHO NGƯỜI DÙNG ĐĂNG NHẬP (UserController)
  // ==========================================

  // Lấy thông tin chi tiết profile của tài khoản hiện tại - GET: /users/profile
  getProfile: async (): Promise<UserResponse> => {
    const response = await api.get<UserResponse>('/users/profile');
    return response.data;
  },

  // Cập nhật thông tin profile cá nhân - PUT: /users/profile
  updateProfile: async (data: UpdateProfileRequest): Promise<UserResponse> => {
    const response = await api.put<UserResponse>('/users/profile', data);
    return response.data;
  },

  // Đổi mật khẩu tài khoản (Đã chuyển sang đúng UserController của BE) - PUT: /users/change-password
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await api.put('/users/change-password', data);
  }
};