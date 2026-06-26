import { api } from './api';
import type { PageResponse } from './voucher'; // (PageResponse định nghĩa cấu trúc phân trang JPA)

// Ánh xạ cấu trúc từ UserResponse và User.java của Backend
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

// Định nghĩa Interface truyền vào khi đổi mật khẩu (khớp ChangePasswordRequest.java)
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

// Định nghĩa Interface truyền vào khi cập nhật Profile (khớp UpdateProfileRequest)
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

  // GET: /admin/users?page=...&size=...
  getAllUsersAdmin: async (page = 0, size = 20): Promise<PageResponse<UserResponse>> => {
    try {
      const response = await api.get<PageResponse<UserResponse>>('/admin/users', {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.warn("Chưa kết nối được API Admin, trả về Mock Data danh sách User:");
      return {
        content: [
          { userId: 1, username: "vinhnn", email: "vinh@gmail.com", fullName: "Nguyễn Ngọc Vinh", phone: "0901234567", address: "Phường Long Bình, TP. HCM", isActive: true },
          { userId: 2, username: "khanhnd", email: "kha@gmail.com", fullName: "Nguyễn Hoàng Kha", phone: "0907654321", address: "Thành phố Hồ Chí Minh", isActive: false }
        ],
        totalPages: 1,
        totalElements: 2,
        size: 20,
        number: 0
      };
    }
  },

  // PUT: /admin/users/{id}/active?active=true/false
  toggleUserActive: async (id: number, active: boolean): Promise<UserResponse> => {
    // Truyền tham số active qua Query Parameter theo thiết kế của @RequestParam
    const response = await api.put<UserResponse>(`/admin/users/${id}/active`, null, {
      params: { active }
    });
    return response.data;
  },

  // ==========================================
  // 2. DÀNH CHO KHÁCH HÀNG / PROFILE CÁ NHÂN (UserController)
  // ==========================================

  // GET: /users/profile
  getProfile: async (): Promise<UserResponse> => {
    const response = await api.get<UserResponse>('/users/profile');
    return response.data;
  },

  // PUT: /users/profile
  updateProfile: async (data: UpdateProfileRequest): Promise<UserResponse> => {
    const response = await api.put<UserResponse>('/users/profile', data);
    return response.data;
  },

  // PUT: /users/change-password
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await api.put('/users/change-password', data);
  }
};