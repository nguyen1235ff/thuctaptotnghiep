import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import type { Food } from '../services/food'; 

interface MenuItemCardProps {
  food: Food;
}

export default function MenuItemCard({ food }: MenuItemCardProps) {
  // Đồng bộ theo Zustand Store kết nối trực tiếp với DB Backend
  const cart = useCartStore((state) => state.cart);
  const addItemToCart = useCartStore((state) => state.addItemToCart);
  const updateCartItem = useCartStore((state) => state.updateCartItem);

  // Tìm danh sách món ăn của nhà hàng này trong giỏ hàng
  const currentRestaurantCart = cart[food.restaurantId] || [];
  
  // Tìm xem món ăn hiện tại đã có trong giỏ hàng chưa
  const cartItem = currentRestaurantCart.find((item) => item.foodId === food.foodId);
  const currentQuantity = cartItem ? cartItem.quantity : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Xử lý khi bấm nút "Thêm vào giỏ" lần đầu tiên
  const handleAdd = async () => {
    try {
      // Kiểm tra chéo xem người dùng có đang đặt món ở nhà hàng khác không
      const activeRestaurantIds = Object.keys(cart).filter(id => cart[Number(id)].length > 0);
      if (activeRestaurantIds.length > 0 && !activeRestaurantIds.includes(String(food.restaurantId))) {
        alert("⚠️ Bạn đang đặt món ở một nhà hàng khác! Vui lòng hoàn tất hoặc xóa giỏ hàng cũ trước khi thêm món từ quán mới.");
        return;
      }

      await addItemToCart({
        foodId: food.foodId,
        quantity: 1
      });
    } catch (error) {
      console.error("Lỗi khi thêm món vào giỏ hàng:", error);
    }
  };

  // Xử lý khi tăng/giảm số lượng món ăn
  const handleUpdateQuantity = async (newQuantity: number) => {
    try {
      if (!cartItem) return;
      await updateCartItem(cartItem.cartItemId, newQuantity);
    } catch (error) {
      console.error("Lỗi khi cập nhật số lượng món ăn:", error);
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 flex gap-4 shadow-xs hover:shadow-md transition-all">
      {/* Ảnh món ăn - Sửa thành food.imageUrl */}
      <img 
        src={food.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500"} 
        alt={food.foodName} 
        className="w-20 h-20 rounded-xl object-cover bg-slate-50 border border-slate-100 shrink-0"
      />

      {/* Thông tin món ăn */}
      <div className="flex flex-col flex-1 justify-between py-0.5">
        <div>
          {/* Tên món - Sửa thành food.foodName */}
          <h3 className="text-xs font-black text-slate-800 line-clamp-1 uppercase tracking-tight">
            {food.foodName}
          </h3>
          <p className="text-[11px] text-slate-400 font-medium line-clamp-2 mt-1 leading-relaxed">
            {food.description || "Món ăn thơm ngon, đậm đà hương vị truyền thống chuẩn vị quán làm."}
          </p>
        </div>

        <div className="flex items-center justify-between mt-3">
          <span className="text-xs font-black text-orange-500">
            {formatCurrency(food.price)}
          </span>

          {/* Điều khiển số lượng */}
          {currentQuantity > 0 ? (
            <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 px-2 py-1 rounded-full animate-fade-in">
              <button 
                onClick={() => handleUpdateQuantity(currentQuantity - 1)}
                className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-orange-600 shadow-xs hover:bg-orange-100 transition-colors cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-black text-orange-700 w-4 text-center">{currentQuantity}</span>
              <button 
                onClick={() => handleUpdateQuantity(currentQuantity + 1)}
                className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-xs hover:bg-orange-600 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              disabled={food.isAvailable === false}
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black text-[10px] px-3 py-2 rounded-xl shadow-xs transition-all uppercase tracking-wider disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {food.isAvailable === false ? 'Hết hàng' : 'Thêm món'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}