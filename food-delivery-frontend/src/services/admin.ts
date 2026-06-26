import { api } from './api';
import type { Order } from './order';

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export const adminService = {
  // Lấy toàn bộ đơn hàng phân trang
  getAllOrders: async (page = 0, size = 20): Promise<PageResponse<Order>> => {
    const response = await api.get<PageResponse<Order>>('/admin/orders', {
      params: { page, size }
    });
    return response.data;
  },

  // CẬP NHẬT: Truyền status qua params để khớp với @RequestParam của Spring Boot
  updateOrderStatus: async (orderId: number, status: Order['status']): Promise<Order> => {
    const response = await api.put<Order>(`/admin/orders/${orderId}/status`, null, {
      params: { status }
    });
    return response.data;
  }
};