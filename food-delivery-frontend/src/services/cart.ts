import { api } from './api';

// 1. DTO NHẬN VỀ: Ánh xạ chính xác 100% từ CartItemResponse.java của Backend
export interface CartItemResponse {
  cartItemId: number;
  foodId: number;
  foodName: string;
  quantity: number;
  unitPrice: number;   // ✅ Đã sửa từ price -> unitPrice
  totalPrice: number;  // ✅ Bổ sung thành tiền của riêng món này
}

// 2. DTO NHẬN VỀ: Ánh xạ chính xác 100% từ CartResponse.java của Backend
export interface CartResponse {
  cartId: number;
  restaurantId: number;   // ✅ Nhận trực tiếp ID nhà hàng từ BE
  restaurantName: string; // ✅ Nhận trực tiếp Tên nhà hàng từ BE
  totalItems: number;     // Tổng số lượng các món trong giỏ
  subtotal: number;       // ✅ Đã sửa từ totalPrice -> subtotal (Tổng tiền chưa ship/voucher)
  items: CartItemResponse[];
}

// 3. DTO GỬI LÊN: Khớp hoàn toàn với AddToCartRequest.java (Đã chuẩn)
export interface AddToCartRequest {
  foodId: number;
  quantity: number;
}

export const cartService = {
  // 1. LẤY THÔNG TIN GIỎ HÀNG CỦA NGƯỜI DÙNG ĐANG ĐĂNG NHẬP - GET /cart
  getCart: async (): Promise<CartResponse> => {
    const response = await api.get<CartResponse>('/cart');
    return response.data;
  },

  // 2. THÊM MỘT SẢN PHẨM MỚI HOẶC TĂNG SỐ LƯỢNG TRONG GIỎ HÀNG - POST /cart/items
  addItemToCart: async (data: AddToCartRequest): Promise<CartResponse> => {
    const response = await api.post<CartResponse>('/cart/items', data);
    return response.data;
  },

  // 3. CẬP NHẬT SỐ LƯỢNG CỦA MỘT MÓN ĂN CỤ THỂ TRONG GIỎ - PUT /cart/items/{cartItemId}?quantity=...
  updateCartItem: async (cartItemId: number, quantity: number): Promise<CartResponse> => {
    const response = await api.put<CartResponse>(`/cart/items/${cartItemId}`, null, {
      params: { quantity }
    });
    return response.data;
  },

  // 4. XÓA MỘT SẢN PHẨM KHỎI GIỎ HÀNG - DELETE /cart/items/{cartItemId}
  removeItemFromCart: async (cartItemId: number): Promise<CartResponse> => {
    const response = await api.delete<CartResponse>(`/cart/items/${cartItemId}`);
    return response.data;
  },

  // 5. XÓA TOÀN BỘ GIỎ HÀNG - DELETE /cart
  clearCart: async (): Promise<CartResponse> => {
    const response = await api.delete<CartResponse>('/cart');
    return response.data;
  }
};