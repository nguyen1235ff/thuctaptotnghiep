import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react'; 
import type { Food } from '../services/food';

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
  addToCart: (food: Food, resName: string) => void;
  removeFromCart: (foodId: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  // Lưu trữ giỏ hàng vào localStorage để khi user F5 không bị mất món ăn đã chọn
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('food_delivery_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [restaurantId, setRestaurantId] = useState<number | null>(() => {
    const savedId = localStorage.getItem('cart_restaurant_id');
    return savedId ? Number(savedId) : null;
  });

  const [restaurantName, setRestaurantName] = useState<string | null>(() => {
    return localStorage.getItem('cart_restaurant_name') || null;
  });

  // Tự động đồng bộ vào localStorage mỗi khi giỏ hàng thay đổi
  useEffect(() => {
    localStorage.setItem('food_delivery_cart', JSON.stringify(cartItems));
    if (restaurantId) {
      localStorage.setItem('cart_restaurant_id', String(restaurantId));
    } else {
      localStorage.removeItem('cart_restaurant_id');
    }
    if (restaurantName) {
      localStorage.setItem('cart_restaurant_name', restaurantName);
    } else {
      localStorage.removeItem('cart_restaurant_name');
    }
  }, [cartItems, restaurantId, restaurantName]);

  // 1. THÊM MÓN ĂN VÀO GIỎ HÀNG (Hoặc tăng số lượng lên 1)
  const addToCart = (food: Food, resName: string) => {
    // NGUYÊN TẮC: Kiểm tra nếu chọn món ở nhà hàng khác với nhà hàng hiện tại trong giỏ
    if (restaurantId && restaurantId !== food.restaurantId) {
      const confirmClear = window.confirm(
        '⚠️ Bạn đang chọn món ở một nhà hàng khác. Việc này sẽ xóa toàn bộ món ăn hiện tại trong giỏ hàng của nhà hàng cũ. Bạn có đồng ý không?'
      );
      if (!confirmClear) return;
      
      // Nếu user đồng ý, xóa sạch giỏ cũ để gom đơn cho nhà hàng mới
      setCartItems([{
        foodId: food.foodId,
        name: food.name,
        price: food.price,
        image: food.image,
        quantity: 1,
        restaurantId: food.restaurantId
      }]);
      setRestaurantId(food.restaurantId);
      setRestaurantName(resName);
      return;
    }

    // Nếu chưa có nhà hàng nào, thiết lập nhà hàng hiện tại
    if (!restaurantId) {
      setRestaurantId(food.restaurantId);
      setRestaurantName(resName);
    }

    // Thực hiện thêm món hoặc tăng số lượng
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.foodId === food.foodId);
      if (existingItem) {
        return prevItems.map((item) =>
          item.foodId === food.foodId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, {
        foodId: food.foodId,
        name: food.name,
        price: food.price,
        image: food.image,
        quantity: 1,
        restaurantId: food.restaurantId
      }];
    });
  };

  // 2. GIẢM SỐ LƯỢNG MÓN ĂN (Nếu về 0 thì xóa khỏi giỏ)
  const removeFromCart = (foodId: number) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.foodId === foodId);
      if (!existingItem) return prevItems;

      if (existingItem.quantity === 1) {
        const updatedItems = prevItems.filter((item) => item.foodId !== foodId);
        // Nếu giỏ hàng rỗng, giải phóng nhà hàng đang liên kết luôn
        if (updatedItems.length === 0) {
          setRestaurantId(null);
          setRestaurantName(null);
        }
        return updatedItems;
      }

      return prevItems.map((item) =>
        item.foodId === foodId ? { ...item, quantity: item.quantity - 1 } : item
      );
    });
  };

  // 3. XÓA SẠCH GIỎ HÀNG (Gọi sau khi Đặt Hàng thành công)
  const clearCart = () => {
    setCartItems([]);
    setRestaurantId(null);
    setRestaurantName(null);
    localStorage.removeItem('food_delivery_cart');
    localStorage.removeItem('cart_restaurant_id');
    localStorage.removeItem('cart_restaurant_name');
  };

  // 4. HÀM TÍNH TỔNG TIỀN TẠM TÍNH CỦA CÁC MÓN ĂN
  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // 5. HÀM ĐẾM TỔNG SỐ LƯỢNG ITEM ĐỂ ĐƯA LÊN BADGE ICON GIỎ HÀNG TRÊN HEADER
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
      getTotalItems
    }}>
      {children}
    </CartContext.Provider>
  );
}

// Hook tiện ích để lấy dữ liệu nhanh ở mọi Component con
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart phải được bọc bên trong một CartProvider');
  }
  return context;
}