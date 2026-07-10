import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Food } from '../services/food';
import { api } from '../services/api';

export interface CartItem {
  cartItemId: number;
  foodId: number;
  foodName: string;
  unitPrice: number;   // ✅ Đã sửa từ price -> unitPrice để khớp BE
  totalPrice: number;  // ✅ Bổ sung thành tiền của riêng món này từ BE
  quantity: number;
  restaurantId: number;
  imageUrl?: string;   // Nhận đường dẫn ảnh từ thực thể Food
}

interface CartContextType {
  cartItems: CartItem[];
  restaurantId: number | null;
  restaurantName: string | null;
  addToCart: (food: Food, resName: string) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>; // Thay đổi tham số truyền vào thành cartItemId theo chuẩn DB
  updateQuantity: (cartItemId: number, newQuantity: number) => Promise<void>; // Bổ sung hàm cập nhật số lượng chuẩn hóa
  clearCart: () => Promise<void>;
  getSubtotal: () => number;
  getTotalItems: () => number;
  isLoadingCart: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  // Đồng bộ giỏ hàng cục bộ ban đầu từ LocalStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('food_delivery_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [restaurantId, setRestaurantId] = useState<number | null>(() => {
    const savedId = localStorage.getItem('cart_restaurant_id');
    return savedId ? Number(savedId) : null;
  });

  const [restaurantName, setRestaurantName] = useState<string | null>(() => {
    return localStorage.getItem('cart_restaurant_name');
  });

  const [isLoadingCart, setIsLoadingCart] = useState(false);

  // Lưu trạng thái xuống localStorage làm bộ nhớ đệm phụ
  useEffect(() => {
    localStorage.setItem('food_delivery_cart', JSON.stringify(cartItems));
    if (restaurantId) localStorage.setItem('cart_restaurant_id', String(restaurantId));
    else localStorage.removeItem('cart_restaurant_id');
    
    if (restaurantName) localStorage.setItem('cart_restaurant_name', restaurantName);
    else localStorage.removeItem('cart_restaurant_name');
  }, [cartItems, restaurantId, restaurantName]);

  // ĐỒNG BỘ: Tự động kéo giỏ hàng thực tế từ Backend về ngay khi ứng dụng khởi chạy
  const fetchBackendCart = async () => {
    try {
      setIsLoadingCart(true);
      const response = await api.get('/cart'); // Khớp API GET /cart từ Backend
      if (response.data && response.data.items) {
        setRestaurantId(response.data.restaurantId);
        setRestaurantName(response.data.restaurantName);
        
        // ✅ Khớp chính xác cấu trúc trường dữ liệu từ CartItemResponse.java của Backend
        const backendItems: CartItem[] = response.data.items.map((item: any) => ({
          cartItemId: item.cartItemId,
          foodId: item.foodId,
          foodName: item.foodName,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          quantity: item.quantity,
          restaurantId: response.data.restaurantId
        }));
        setCartItems(backendItems);
      }
    } catch (error) {
      console.warn("⚠️ Chưa đăng nhập hoặc hệ thống gặp sự cố. Sử dụng dữ liệu cục bộ.");
    } finally {
      setIsLoadingCart(false);
    }
  };

  useEffect(() => {
    fetchBackendCart();
  }, []);

  // 1. THÊM MÓN MỚI VÀO GIỎ HÀNG (Khớp AddToCartRequest.java)
  const addToCart = async (food: Food, _resName: string) => {
    // Nếu đổi sang đặt món ở nhà hàng khác, tự động xóa sạch giỏ hàng cũ trên Database trước
    if (restaurantId && restaurantId !== food.restaurantId) {
      try {
        await api.delete('/cart');
      } catch (e) { console.error(e); }
      setCartItems([]);
    }

    try {
      // Gọi API POST /cart/items truyền dữ liệu lên body đúng chuẩn AddToCartRequest.java
      await api.post('/cart/items', {
        foodId: food.foodId,
        quantity: 1
      });
      // Tải lại giỏ hàng mới từ Database để nhận cartItemId và số tiền chính xác từ Backend
      await fetchBackendCart();
    } catch (error) {
      console.error("Lỗi đồng bộ thêm món ăn:", error);
    }
  };

  // 2. CẬP NHẬT SỐ LƯỢNG MÓN ĂN TRONG GIỎ (Khớp chuẩn PUT /cart/items/{cartItemId}?quantity=...)
  const updateQuantity = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }

    try {
      // ✅ SỬA CHUẨN: Truyền dữ liệu qua Params và Path Variable theo đúng thiết kế Backend
      await api.put(`/cart/items/${cartItemId}`, null, {
        params: { quantity: newQuantity }
      });
      await fetchBackendCart();
    } catch (error) {
      console.error("Lỗi cập nhật số lượng món ăn:", error);
    }
  };

  // 3. XÓA MỘT SẢN PHẨM KHỎI GIỎ HÀNG (DELETE /cart/items/{cartItemId})
  const removeFromCart = async (cartItemId: number) => {
    try {
      await api.delete(`/cart/items/${cartItemId}`);
      const updatedItems = cartItems.filter((item) => item.cartItemId !== cartItemId);
      setCartItems(updatedItems);
      if (updatedItems.length === 0) {
        setRestaurantId(null);
        setRestaurantName(null);
      }
      await fetchBackendCart();
    } catch (error) {
      console.error("Lỗi xóa món ăn khỏi giỏ hàng:", error);
    }
  };

  // 4. XÓA SẠCH HOÀN TOÀN GIỎ HÀNG (DELETE /cart)
  const clearCart = async () => {
    setCartItems([]);
    setRestaurantId(null);
    setRestaurantName(null);
    localStorage.removeItem('food_delivery_cart');
    localStorage.removeItem('cart_restaurant_id');
    localStorage.removeItem('cart_restaurant_name');

    try {
      await api.delete('/cart');
    } catch (error) {
      console.error("Lỗi làm trống giỏ hàng:", error);
    }
  };

  // 5. TÍNH TỔNG TIỀN TẠM TÍNH DỰA TRÊN TRƯỜNG unitPrice MỚI ĐỒNG BỘ
  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
  };

  // 6. ĐẾM TỔNG SỐ LƯỢNG MÓN ĂN TRÊN BADGE NỔI GIAO DIỆN
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      restaurantId,
      restaurantName,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getSubtotal,
      getTotalItems,
      isLoadingCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}