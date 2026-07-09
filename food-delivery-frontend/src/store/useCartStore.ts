import { create } from 'zustand';
import { cartService, type CartResponse } from '../services/cart';

interface CartState {
  // Giỏ hàng map theo restaurantId để FE quản lý phân tách các quán ăn dễ dàng
  cart: Record<number, any[]>; 
  totalPrice: number;
  voucherCode: string | null;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | null;
  discountValue: number;

  // Các hàm tương tác trực tiếp với API Backend
  fetchCart: () => Promise<void>;
  addItemToCart: (data: { foodId: number; quantity: number }) => Promise<void>;
  updateCartItem: (cartItemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  
  // Các hàm tính toán phục vụ UI
  applyVoucher: (code: string, type: 'PERCENTAGE' | 'FIXED_AMOUNT', value: number) => void;
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getFinalTotal: (deliveryFee: number) => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: {},
  totalPrice: 0,
  voucherCode: null,
  discountType: null,
  discountValue: 0,

  // Lấy dữ liệu giỏ hàng hiện tại từ Backend về lưu vào Store khi vừa vào App
  fetchCart: async () => {
    try {
      const data = await cartService.getCart();
      // Nhóm item theo restaurantId (Backend CartResponse có chứa thông tin item)
      // Lưu ý: Đảm bảo CartItemResponse từ BE có trường restaurantId, nếu không có bạn có thể nhóm chung hoặc map từ danh sách
      const groupCart: Record<number, any[]> = {};
      
      if (data.items && data.items.length > 0) {
        // Tạm thời gom vào ID của quán hiện tại (Giỏ hàng Backend thiết kế theo User nên tại 1 thời điểm chỉ thuộc 1 quán)
        // Giả lập lấy restaurantId từ item đầu tiên nếu BE trả về, hoặc mặc định gom nhóm
        data.items.forEach(item => {
          // Giả định Backend trả về restaurantId trong item, nếu không có ta mặc định lấy theo ngữ cảnh quán đang xem
          const resId = (item as any).restaurantId || 1; 
          if (!groupCart[resId]) groupCart[resId] = [];
          groupCart[resId].push(item);
        });
      }

      set({ 
        cart: groupCart, 
        totalPrice: data.totalPrice 
      });
    } catch (error) {
      console.error("Không thể lấy dữ liệu giỏ hàng từ BE:", error);
    }
  },

  addItemToCart: async (payload) => {
    try {
      const updatedCart = await cartService.addItemToCart(payload);
      // Cập nhật lại state của store sau khi BE tính toán xong
      const groupCart: Record<number, any[]> = {};
      updatedCart.items.forEach(item => {
        const resId = (item as any).restaurantId || 1;
        if (!groupCart[resId]) groupCart[resId] = [];
        groupCart[resId].push(item);
      });
      set({ cart: groupCart, totalPrice: updatedCart.totalPrice });
    } catch (error) {
      console.error("Lỗi thêm sản phẩm:", error);
      throw error;
    }
  },

  updateCartItem: async (cartItemId, quantity) => {
    try {
      let updatedCart;
      if (quantity <= 0) {
        updatedCart = await cartService.removeItemFromCart(cartItemId);
      } else {
        updatedCart = await cartService.updateCartItem(cartItemId, quantity);
      }
      
      const groupCart: Record<number, any[]> = {};
      updatedCart.items.forEach(item => {
        const resId = (item as any).restaurantId || 1;
        if (!groupCart[resId]) groupCart[resId] = [];
        groupCart[resId].push(item);
      });
      set({ cart: groupCart, totalPrice: updatedCart.totalPrice });
    } catch (error) {
      console.error("Lỗi cập nhật số lượng:", error);
    }
  },

  clearCart: async () => {
    try {
      await cartService.clearCart();
      set({ cart: {}, totalPrice: 0, voucherCode: null, discountType: null, discountValue: 0 });
    } catch (error) {
      console.error("Lỗi xóa giỏ hàng:", error);
    }
  },

  applyVoucher: (code, type, value) => set({
    voucherCode: code,
    discountType: type,
    discountValue: value
  }),

  getSubtotal: () => {
    return get().totalPrice;
  },

  getDiscountAmount: () => {
    const subtotal = get().getSubtotal();
    const { discountType, discountValue } = get();
    if (!discountType) return 0;
    if (discountType === 'PERCENTAGE') {
      return (subtotal * discountValue) / 100;
    }
    return discountValue;
  },

  getFinalTotal: (deliveryFee: number) => {
    const subtotal = get().getSubtotal();
    const discount = get().getDiscountAmount();
    return Math.max(0, subtotal + deliveryFee - discount);
  }
}));