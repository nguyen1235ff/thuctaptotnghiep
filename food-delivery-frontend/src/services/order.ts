import { api } from './api';
import type { PageResponse } from './voucher';

// 1. DTO NHẬN VỀ: Ánh xạ chính xác từ OrderItemResponse.java của Backend
export interface OrderItem {
  orderItemId?: number;
  foodName: string;
  quantity: number;
  unitPrice: number;   // ✅ Đã sửa từ price -> unitPrice để khớp BE
  totalPrice: number;  // ✅ Bổ sung thêm trường thành tiền của món ăn
  image?: string;
}

// 2. DTO NHẬN VỀ: Ánh xạ chính xác từ OrderResponse.java của Backend
export interface Order {
  orderId: number; 
  orderCode: string;   // ✅ Bổ sung thêm mã đơn hàng (chuỗi tường minh)
  restaurantName: string;
  deliveryAddress: string;
  deliveryPhone: string;
  subtotal: number;
  deliveryFee: number;
  discountAmount: number; // ✅ Đã sửa từ discount -> discountAmount để khớp BE
  totalAmount: number;
  orderStatus: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY_FOR_PICKUP' | 'DELIVERING' | 'COMPLETED' | 'CANCELLED' | string; // ✅ Đã sửa từ status -> orderStatus để khớp BE
  paymentMethod: string;
  notes?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

// 3. DTO GỬI LÊN: Ánh xạ chính xác từ CreateOrderRequest.java của Backend
export interface CreateOrderRequest {
  deliveryAddress: string;
  deliveryPhone: string;
  voucherCode?: string;
  paymentMethod: string; 
  notes?: string;
}

export const orderService = {
  // ==========================================
  // 1. DÀNH CHO KHÁCH HÀNG (CUSTOMER)
  // ==========================================

  // Tạo đơn hàng mới từ giỏ hàng - POST /orders
  createOrder: async (requestData: CreateOrderRequest): Promise<Order> => {
    const response = await api.post<Order>('/orders', requestData);
    return response.data;
  },

  // Lấy lịch sử đơn hàng phân trang - GET /orders
  getHistory: async (page = 0, size = 10): Promise<PageResponse<Order>> => {
    const response = await api.get<PageResponse<Order>>('/orders', {
      params: { page, size }
    });
    return response.data;
  },

  // Khách hàng tự hủy đơn - PUT /orders/{id}/cancel
  cancelOrder: async (orderId: number): Promise<Order> => {
    const response = await api.put<Order>(`/orders/${orderId}/cancel`);
    return response.data;
  },

  // ==========================================
  // 2. DÀNH CHO CHỦ NHÀ HÀNG (RESTAURANT OWNER)
  // ==========================================

  // Lấy danh sách đơn hàng của một nhà hàng cụ thể - GET /orders/restaurant/{restaurantId}
  getRestaurantOrders: async (restaurantId: number, page = 0, size = 50): Promise<PageResponse<Order>> => {
    const response = await api.get<PageResponse<Order>>(`/orders/restaurant/${restaurantId}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Chủ hàng/Shipper cập nhật trạng thái đơn - PUT /orders/{id}/status?status=...
  updateOrderStatus: async (orderId: number, status: Order['orderStatus']): Promise<Order> => {
    const response = await api.put<Order>(`/orders/${orderId}/status`, null, {
      params: { status }
    });
    return response.data;
  }
};