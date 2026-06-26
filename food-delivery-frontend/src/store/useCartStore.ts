import { create } from 'zustand';
import type { CartItem, Food } from '../types';

interface CartState {
  items: CartItem[];
  voucherCode: string | null;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | null;
  discountValue: number; // Tỷ lệ % hoặc số tiền cố định được giảm
  deliveryFee: number;   // Lấy từ thực tế của Nhà hàng
  currentRestaurantId: number | null; // Rất quan trọng: Chỉ cho phép đặt món ở 1 nhà hàng mỗi lượt
  addToCart: (food: Food, deliveryFee: number) => boolean; // Trả về true nếu thêm thành công, false nếu khác nhà hàng
  removeFromCart: (foodId: number) => void;
  updateQuantity: (foodId: number, quantity: number) => void;
  applyVoucher: (code: string, type: 'PERCENTAGE' | 'FIXED_AMOUNT', value: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getFinalTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  voucherCode: null,
  discountType: null,
  discountValue: 0,
  deliveryFee: 0,
  currentRestaurantId: null,

  addToCart: (food, deliveryFee) => {
    const { items, currentRestaurantId } = get();

    // Kiểm tra xem có đang đặt món ở nhà hàng khác không
    if (currentRestaurantId !== null && currentRestaurantId !== food.restaurantId) {
      return false; // Trả về false để UI hiển thị thông báo "Bạn có muốn xóa giỏ hàng cũ?"
    }

    const existingItem = items.find(item => item.food.foodId === food.foodId);
    
    if (existingItem) {
      set({
        items: items.map(item =>
          item.food.foodId === food.foodId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      });
    } else {
      set({
        items: [...items, { food, quantity: 1 }],
        currentRestaurantId: food.restaurantId,
        deliveryFee: deliveryFee // Gán phí ship của chính nhà hàng đó luôn
      });
    }
    return true;
  },

  removeFromCart: (foodId) => set((state) => {
    const nextItems = state.items.filter(item => item.food.foodId !== foodId);
    return {
      items: nextItems,
      currentRestaurantId: nextItems.length === 0 ? null : state.currentRestaurantId
    };
  }),

  updateQuantity: (foodId, quantity) => set((state) => {
    if (quantity <= 0) {
      const nextItems = state.items.filter(item => item.food.foodId !== foodId);
      return {
        items: nextItems,
        currentRestaurantId: nextItems.length === 0 ? null : state.currentRestaurantId
      };
    }
    return {
      items: state.items.map(item =>
        item.food.foodId === foodId ? { ...item, quantity } : item
      )
    };
  }),

  applyVoucher: (code, type, value) => set({
    voucherCode: code,
    discountType: type,
    discountValue: value
  }),

  clearCart: () => set({ 
    items: [], 
    voucherCode: null, 
    discountType: null, 
    discountValue: 0, 
    deliveryFee: 0, 
    currentRestaurantId: null 
  }),

  getSubtotal: () => {
    return get().items.reduce((total, item) => total + (item.food.price * item.quantity), 0);
  },

  getDiscountAmount: () => {
    const subtotal = get().getSubtotal();
    const { discountType, discountValue } = get();
    if (!discountType) return 0;
    
    if (discountType === 'PERCENTAGE') {
      return (subtotal * discountValue) / 100;
    } else {
      return discountValue; // FIXED_AMOUNT
    }
  },

  getFinalTotal: () => {
    const subtotal = get().getSubtotal();
    const discount = get().getDiscountAmount();
    const final = subtotal + get().deliveryFee - discount;
    return final < 0 ? 0 : final;
  }
}));