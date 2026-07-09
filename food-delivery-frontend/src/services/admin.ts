import { api } from './api';
import type { Order } from './order';
import type { UserResponse } from './user'; // Đảm bảo bạn đã export UserResponse từ file user.ts
import type { VoucherResponse, VoucherRequest } from './voucher'; // Đảm bảo đã import từ voucher.ts

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export const adminService = {
  // ==========================================
  // 1. QUẢN LÝ NGƯỜI DÙNG TRÊN HỆ THỐNG
  // ==========================================

  // Lấy toàn bộ danh sách tài khoản phân trang - GET /admin/users
  getAllUsers: async (page = 0, size = 20): Promise<PageResponse<UserResponse>> => {
    const response = await api.get<PageResponse<UserResponse>>('/admin/users', {
      params: { page, size }
    });
    return response.data;
  },

  // Bật/Tắt trạng thái hoạt động (Khóa/Mở khóa) tài khoản - PUT /admin/users/{id}/active?active=true/false
  toggleUserActive: async (id: number, active: boolean): Promise<UserResponse> => {
    const response = await api.put<UserResponse>(`/admin/users/${id}/active`, null, {
      params: { active }
    });
    return response.data;
  },

  // ==========================================
  // 2. QUẢN LÝ VOUCHER KHUYẾN MÃI TOÀN HỆ THỐNG
  // ==========================================

  // Lấy danh sách Voucher của Admin - GET /admin/vouchers
  getAllVouchersAdmin: async (page = 0, size = 20): Promise<PageResponse<VoucherResponse>> => {
    const response = await api.get<PageResponse<VoucherResponse>>('/admin/vouchers', {
      params: { page, size }
    });
    return response.data;
  },

  // Tạo mới một chương trình Voucher - POST /admin/vouchers
  createVoucher: async (data: VoucherRequest): Promise<VoucherResponse> => {
    const response = await api.post<VoucherResponse>('/admin/vouchers', data);
    return response.data;
  },

  // Cập nhật thông tin chi tiết Voucher - PUT /admin/vouchers/{id}
  updateVoucher: async (id: number, data: VoucherRequest): Promise<VoucherResponse> => {
    const response = await api.put<VoucherResponse>(`/admin/vouchers/${id}`, data);
    return response.data;
  },

  // Xóa bỏ Voucher khỏi hệ thống (Soft Delete) - DELETE /admin/vouchers/{id}
  deleteVoucher: async (id: number): Promise<void> => {
    await api.delete(`/admin/vouchers/${id}`);
  },

  // ==========================================
  // 3. QUẢN LÝ ĐƠN HÀNG TOÀN CỤC (Nếu BE bổ sung quyền ADMIN)
  // ==========================================

  // Lấy toàn bộ đơn hàng hệ thống (Đã sửa URL từ /admin/orders thành /orders nếu dùng chung bộ lọc)
  getAllOrders: async (page = 0, size = 20): Promise<PageResponse<Order>> => {
    const response = await api.get<PageResponse<Order>>('/orders', {
      params: { page, size }
    });
    return response.data;
  },

  // Cập nhật trạng thái đơn hàng - PUT /orders/{id}/status?status=...
  updateOrderStatus: async (orderId: number, status: Order['orderStatus']): Promise<Order> => {
    const response = await api.put<Order>(`/orders/${orderId}/status`, null, {
      params: { status }
    });
    return response.data;
  }
};