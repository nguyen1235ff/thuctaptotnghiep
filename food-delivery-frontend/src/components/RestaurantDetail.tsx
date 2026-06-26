import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { foodService } from '../services/food';
import { useCartStore } from '../store/useCartStore';
import MenuItemCard from '../components/MenuItemCard';
import { ArrowLeft, Star, MapPin, Phone, ShoppingBag, Loader2 } from 'lucide-react';

// Định nghĩa nhanh danh sách info nhà hàng phục vụ cho việc hiển thị Header nhanh
const LOCAL_RESTAURANTS_INFO = [
  { id: 1, name: "Cơm Tấm Phúc Lộc Thọ - Long Bình", rating: 4.8, fee: 15000, address: "Đường Nguyễn Xiển, Phường Long Bình, TP. Thủ Đức", phone: "0901234567" },
  { id: 2, name: "Bún Đậu Mắm Tôm Phố Cổ", rating: 4.5, fee: 18000, address: "Phường Long Bình, TP. Hồ Chí Minh", phone: "0907654321" },
  { id: 3, name: "Gà Rán KFC - Vincom Grand Park", rating: 4.2, fee: 20000, address: "Khu dân cư Vinhomes Grand Park, Long Bình", phone: "19006886" }
];

export default function RestaurantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const restaurantId = Number(id);

  // Lấy thông tin giỏ hàng từ Zustand để làm "Giỏ hàng thu nhỏ" nhảy số lượng góc màn hình
  const { items, getSubtotal } = useCartStore();
  const totalCartItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Tìm thông tin nhà hàng hiện tại
  const restaurantInfo = LOCAL_RESTAURANTS_INFO.find(r => r.id === restaurantId) || LOCAL_RESTAURANTS_INFO[0];

  // Gọi API/Mock bằng React Query lấy danh sách món ăn
  const { data: foods, isLoading } = useQuery({
    queryKey: ['foods', restaurantId],
    queryFn: () => foodService.getByRestaurantId(restaurantId)
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Nút quay lại & Header thông tin nhà hàng */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <button 
            onClick={() => navigate('/')} 
            className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              {restaurantInfo.name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1 text-orange-600 font-semibold">
                <Star className="w-3.5 h-3.5 fill-orange-500 stroke-orange-500" /> {restaurantInfo.rating}
              </span>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {restaurantInfo.address}</span>
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {restaurantInfo.phone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Danh sách Thực đơn món ăn */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h3 className="text-lg font-bold text-slate-800 mb-6 border-l-4 border-orange-500 pl-3">
          Thực đơn của quán
        </h3>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            <span className="text-sm text-slate-400">Đang tải danh mục thực đơn...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {foods?.map((food) => (
              <MenuItemCard 
                key={food.foodId} 
                food={food} 
                deliveryFee={restaurantInfo.fee} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Thanh Giỏ Hàng nổi ở góc dưới khi có món (Floating Checkout Bar) */}
      {totalCartItems > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-xl bg-slate-900 text-white rounded-2xl shadow-xl px-5 py-4 flex items-center justify-between z-50 animate-bounce-short">
          <div className="flex items-center gap-3">
            <div className="relative p-2.5 bg-orange-500 rounded-xl">
              <ShoppingBag className="w-5 h-5 text-white" />
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 border-2 border-slate-950 text-white font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {totalCartItems}
              </span>
            </div>
            <div>
              <p className="text-xs text-slate-400">Giỏ hàng tạm tính</p>
              <p className="text-sm font-bold text-orange-400">{formatCurrency(getSubtotal())}</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/cart')}
            className="bg-orange-500 hover:bg-orange-600 font-bold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            Xem giỏ hàng →
          </button>
        </div>
      )}
    </div>
  );
}