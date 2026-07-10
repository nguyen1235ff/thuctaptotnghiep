import { useNavigate } from 'react-router-dom';
import { Star, Truck, CircleDollarSign } from 'lucide-react';
// Import chuẩn kiểu dữ liệu trả về từ API hệ thống khách hàng công cộng
import type { RestaurantResponse } from '../services/restaurant';

interface RestaurantCardProps {
  restaurant: RestaurantResponse;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const navigate = useNavigate();

  // Định dạng hiển thị tiền tệ VNĐ mượt mà
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div 
      // ĐÃ SỬA: Điều hướng chính xác sang trang thực đơn dành cho Khách hàng lựa chọn món ăn
      onClick={() => navigate(`/customer/restaurant/${restaurant.restaurantId}`)}
      className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md hover:border-orange-100 transition-all duration-300 cursor-pointer group"
    >
      {/* Khối Ảnh Nhà Hàng */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        <img 
          src={restaurant.imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500'} 
          alt={restaurant.restaurantName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Nhãn hiển thị nếu quán tạm nghỉ hoặc không hoạt động */}
        {!restaurant.isActive && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-white/95 text-slate-900 px-3 py-1 rounded-lg text-xs font-black tracking-wide shadow-sm uppercase">
              Tạm đóng cửa
            </span>
          </div>
        )}
      </div>

      {/* Khối Nội Dung Chi Tiết */}
      <div className="p-4">
        <h3 className="font-bold text-slate-800 text-base line-clamp-1 group-hover:text-orange-500 transition-colors">
          {restaurant.restaurantName}
        </h3>
        <p className="text-xs text-slate-400 mt-1 line-clamp-1">
          {restaurant.description || "Chuyên cung cấp các món ăn ngon giao tận nơi."}
        </p>

        {/* Thông tin số sao Đánh giá (Rating & Reviews) */}
        <div className="flex items-center gap-1.5 mt-3">
          <div className="flex items-center bg-orange-50 text-orange-600 font-bold text-xs px-2 py-0.5 rounded-lg gap-0.5">
            <Star className="w-3.5 h-3.5 fill-orange-500 stroke-orange-500" />
            {restaurant.rating?.toFixed(1) || '0.0'}
          </div>
          <span className="text-xs text-slate-400">({restaurant.totalReviews || 0} đánh giá)</span>
        </div>

        {/* Khối Phí Ship & Đơn tối thiểu */}
        <div className="flex items-center justify-between border-t border-slate-50 mt-4 pt-3 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Phí giao: <strong className="text-slate-700 font-bold">{formatCurrency(restaurant.deliveryFee)}</strong></span>
          </div>
          <div className="flex items-center gap-1">
            <CircleDollarSign className="w-3.5 h-3.5 text-amber-500" />
            <span>Tối thiểu: <strong className="text-slate-700 font-bold">{formatCurrency(restaurant.minOrderValue)}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}