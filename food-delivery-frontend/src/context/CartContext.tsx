import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Food } from '../services/food';
import { api } from '../services/api';

// Định nghĩa cấu trúc của một Item nằm trong giỏ hàng ở Client
export interface CartItem {
  foodId: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  restaurantId: number;
}

interface CartContextType {
  cartItems: CartItem[];
  restaurantId: number | null;
  restaurantName: string | null;
  addToCart: (food: Food, resName: string) => Promise<void>;
  removeFromCart: (foodId: number) => Promise<void>;
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

  // Lưu trạng thái xuống localStorage làm bộ nhớ đệm phụ (Offline Mock)
  useEffect(() => {
    localStorage.setItem('food_delivery_cart', JSON.stringify(cartItems));
    if (restaurantId) localStorage.setItem('cart_restaurant_id', String(restaurantId));
    else localStorage.removeItem('cart_restaurant_id');
    
    if (restaurantName) localStorage.setItem('cart_restaurant_name', restaurantName);
    else localStorage.removeItem('cart_restaurant_name');
  }, [cartItems, restaurantId, restaurantName]);

  // ĐỒNG BỘ: Tự động kéo giỏ hàng từ Backend về ngay khi ứng dụng khởi chạy (nếu BE online)
  useEffect(() => {
    const fetchBackendCart = async () => {
      try {
        setIsLoadingCart(true);
        const response = await api.get('/cart'); // Gọi API GET /cart từ CartController.java
        if (response.data && response.data.items) {
          // Khớp cấu trúc trả về từ DB Backend về Client CartItem sử dụng đúng foodId
          const backendItems: CartItem[] = response.data.items.map((item: any) => ({
            foodId: item.food.foodId || item.food.id, // Đề phòng trường hợp DB mapping linh hoạt
            name: item.food.name,
            price: item.food.price,
            image: item.food.image,
            quantity: item.quantity,
            restaurantId: item.food.restaurantId
          }));
          
          if (backendItems.length > 0) {
            setCartItems(backendItems);
            setRestaurantId(backendItems[0].restaurantId);
          }
        }
      } catch (error) {
        console.warn("⚠️ Backend offline hoặc chưa đăng nhập. Sử dụng Giỏ hàng Mock từ LocalStorage.");
      } finally {
        setIsLoadingCart(false);
      }
    };

    fetchBackendCart();
  }, []);

  // 1. THÊM MÓN VÀO GIỎ HÀNG (Sử dụng chuẩn food.foodId)
  const addToCart = async (food: Food, resName: string) => {
    let currentItems = [...cartItems];
    
    // Nếu đổi nhà hàng khác thì xóa sạch giỏ hàng cũ để tránh xung đột
    if (restaurantId && restaurantId !== food.restaurantId) {
      currentItems = [];
      try {
        await api.delete('/cart'); 
      } catch (e) { /* Fallback */ }
    }

    const existingItem = currentItems.find((item) => item.foodId === food.foodId);
    let newQuantity = 1;

    if (existingItem) {
      newQuantity = existingItem.quantity + 1;
      setCartItems(prev => prev.map(item => item.foodId === food.foodId ? { ...item, quantity: newQuantity } : item));
    } else {
      setCartItems(prev => [...currentItems, {
        foodId: food.foodId,
        name: food.name,
        price: food.price,
        image: food.image,
        quantity: 1,
        restaurantId: food.restaurantId
      }]);
      setRestaurantId(food.restaurantId);
      setRestaurantName(resName);
    }

    // Đẩy cập nhật lên DB Backend qua CartController
    try {
      await api.post('/cart/items', {
        foodId: food.foodId,
        quantity: 1 // Tăng thêm 1 đơn vị
      });
    } catch (error) {
      console.warn("⚠️ Không đồng bộ được với DB Backend. Đã lưu món ở chế độ Offline Mock.");
    }
  };

  // 2. GIẢM SỐ LƯỢNG / XÓA KHỎI GIỎ HÀNG
  const removeFromCart = async (foodId: number) => {
    const existingItem = cartItems.find((item) => item.foodId === foodId);
    if (!existingItem) return;

    const targetQuantity = existingItem.quantity - 1;

    if (targetQuantity <= 0) {
      const updatedItems = cartItems.filter((item) => item.foodId !== foodId);
      setCartItems(updatedItems);
      if (updatedItems.length === 0) {
        setRestaurantId(null);
        setRestaurantName(null);
      }
      
      try {
        await api.delete(`/cart/items/${foodId}`);
      } catch (e) {
        console.warn("⚠️ [Offline Mock] Đã xóa sản phẩm khỏi giỏ hàng Client.");
      }
    } else {
      setCartItems(prev => prev.map(item => item.foodId === foodId ? { ...item, quantity: targetQuantity } : item));
      
      try {
        await api.put('/cart/items', {
          foodId: foodId,
          quantity: targetQuantity
        });
      } catch (e) {
        console.warn("⚠️ [Offline Mock] Đã cập nhật giảm số lượng trên Client.");
      }
    }
  };

  // 3. XÓA SẠCH GIỎ HÀNG
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
      console.warn("⚠️ [Offline Mock] Đã làm trống giỏ hàng Client.");
    }
  };

  // 4. HÀM TÍNH TỔNG TIỀN TẠM TÍNH
  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // 5. HÀM ĐẾM TỔNG SỐ LƯỢNG ITEM ĐỂ ĐƯA LÊN BADGE
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