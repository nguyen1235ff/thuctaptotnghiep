import { api } from './api';
import type { PageResponse } from './voucher';

// Ánh xạ chính xác từ OrderItemResponse của Backend
export interface OrderItem {
  foodId: number;
  foodName: string;
  quantity: number;
  price: number;
  image?: string;
}

// Ánh xạ chính xác từ OrderResponse.java của Backend Spring Boot
export interface Order {
  orderId: number; // Đổi từ string thành number để khớp kiểu Integer của Java Backend
  restaurantName: string;
  orderDate: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY_FOR_PICKUP' | 'DELIVERING' | 'COMPLETED' | 'CANCELLED';
  paymentMethod: string;
  deliveryAddress: string;
  deliveryPhone: string;
  notes?: string;
}

// Cấu trúc DTO gửi lên khi đặt hàng (Khớp chuẩn CreateOrderRequest.java ở BE)
export interface CreateOrderRequest {
  deliveryAddress: string;
  deliveryPhone: string;
  voucherCode?: string;
  paymentMethod: string; // Mặc định là "COD"
  notes?: string;
}

export const orderService = {
  // 1. TẠO ĐƠN HÀNG MỚI TỪ GIỎ HÀNG CHỨA TRONG DATABASE (POST /orders)
  createOrder: async (requestData: CreateOrderRequest): Promise<Order> => {
    const response = await api.post<Order>('/orders', requestData);
    return response.data;
  },

  // 2. LẤY LỊCH SỬ ĐƠN HÀNG PHÂN TRANG CỦA KHÁCH HÀNG (GET /orders/customer)
  getHistory: async (page = 0, size = 10): Promise<PageResponse<Order>> => {
    try {
      const response = await api.get<PageResponse<Order>>('/orders/customer', {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.warn("Chưa kết nối được API lịch sử đơn hàng, trả về mảng phân trang rỗng:");
      return {
        content: [],
        totalPages: 0,
        totalElements: 0,
        size: size,
        number: page
      };
    }
  },

  // 3. KHÁCH HÀNG HỦY ĐƠN HÀNG (PUT /orders/{id}/cancel)
  cancelOrder: async (orderId: number): Promise<Order> => {
    const response = await api.put<Order>(`/orders/${orderId}/cancel`);
    return response.data;
  }
};