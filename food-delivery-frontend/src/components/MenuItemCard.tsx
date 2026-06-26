import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import type { Food } from '../types';

interface MenuItemCardProps {
  food: Food;
  deliveryFee: number;
}

export default function MenuItemCard({ food, deliveryFee }: MenuItemCardProps) {
  // Lấy các state và hàm từ Zustand Store ra dùng
  const { items, addToCart, updateQuantity } = useCartStore();
  
  // Tìm xem món ăn này đã có trong giỏ hàng chưa và lấy ra số lượng hiện tại
  const cartItem = items.find(item => item.food.foodId === food.foodId);
  const currentQuantity = cartItem ? cartItem.quantity : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const handleAdd = () => {
    const success = addToCart(food, deliveryFee);
    if (!success) {
      alert("⚠️ Bạn đang đặt món ở một nhà hàng khác! Vui lòng xóa giỏ hàng cũ trước khi thêm món mới.");
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 flex gap-4 shadow-xs hover:shadow-sm transition-all">
      {/* Ảnh món ăn */}
      <img 
        src={food.imageUrl} 
        alt={food.foodName}
        className="w-24 h-24 md:w-28 md:h-28 object-cover rounded-xl bg-slate-50 flex-shrink-0"
      />

      {/* Nội dung chi tiết món */}
      <div className="flex flex-col justify-between flex-1">
        <div>
          <h4 className="font-bold text-slate-800 text-base md:text-lg line-clamp-1">{food.foodName}</h4>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{food.description}</p>
        </div>

        <div className="flex items-center justify-between mt-3">
          <span className="font-extrabold text-orange-600 text-base">
            {formatCurrency(food.price)}
          </span>

          {/* Cụm nút bấm tăng/giảm số lượng */}
          {currentQuantity > 0 ? (
            <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 px-2 py-1 rounded-full">
              <button 
                onClick={() => updateQuantity(food.foodId, currentQuantity - 1)}
                className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-orange-600 shadow-xs hover:bg-orange-100"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-sm font-bold text-orange-700 w-4 text-center">{currentQuantity}</span>
              <button 
                onClick={() => updateQuantity(food.foodId, currentQuantity + 1)}
                className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-xs hover:bg-orange-600"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              disabled={!food.isAvailable}
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-3 py-2 rounded-xl shadow-xs transition-colors disabled:bg-slate-200 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {food.isAvailable ? "Thêm giỏ hàng" : "Hết món"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}