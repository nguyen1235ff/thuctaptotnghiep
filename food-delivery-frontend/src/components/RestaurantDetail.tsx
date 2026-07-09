import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { foodService } from '../services/food';
import { restaurantService } from '../services/restaurant'; 
import { useCartStore } from '../store/useCartStore';
import MenuItemCard from '../components/MenuItemCard';
import { ArrowLeft, Star, MapPin, Phone, ShoppingBag, Loader2 } from 'lucide-react';

export default function RestaurantDetail() {
  const { id } = useParams<{ id: string }>();
  const restaurantId = Number(id);
  const navigate = useNavigate();

  // ĐỒNG BỘ GIỎ HÀNG (Zustand Store thực tế Backend)
  const cart = useCartStore((state) => state.cart);
  const totalPrice = useCartStore((state) => state.totalPrice);

  // Lấy ra danh sách các món ăn thuộc nhà hàng này trong giỏ hàng hiện tại
  const currentRestaurantCart = cart[restaurantId] || [];
  const totalCartItems = currentRestaurantCart.reduce((sum, item) => sum + item.quantity, 0);

  // 1. CALL API: Lấy thông tin chi tiết của Nhà hàng từ Backend
  const { data: restaurantInfo, isLoading: isLoadingRest, error: restError } = useQuery({
    queryKey: ['restaurant-detail', restaurantId],
    queryFn: () => restaurantService.getById(restaurantId),
    enabled: !isNaN(restaurantId),
  });

  // 2. CALL API: Lấy danh sách món ăn thuộc nhà hàng từ Backend (Hệ thống phân trang)
  const { data: foodPage, isLoading: isLoadingFoods } = useQuery({
    queryKey: ['restaurant-foods', restaurantId],
    queryFn: () => foodService.getByRestaurantId(restaurantId, 0, 50), 
    enabled: !isNaN(restaurantId),
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  if (isLoadingRest || isLoadingFoods) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-9 h-9 text-orange-500 animate-spin" />
        <p className="text-sm font-bold text-slate-400">Đang tải thực đơn nhà hàng...</p>
      </div>
    );
  }

  if (!restaurantInfo || restError) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 gap-4 text-center">
        <p className="text-sm font-bold text-red-500">
          ⚠️ Không tìm thấy thông tin nhà hàng hoặc máy chủ gặp sự cố lỗi kết nối!
        </p>
        <button onClick={() => navigate('/')} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold">
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  const foodsList = foodPage?.content || [];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 relative">
      
      {/* BANNER THÔNG TIN CHI TIẾT NHÀ HÀNG */}
      <div className="bg-slate-900 text-white py-12 px-6 relative overflow-hidden shadow-sm">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/')} 
              className="flex items-center gap-1 text-xs text-orange-400 font-bold hover:text-orange-300 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Quay lại trang chủ
            </button>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">{restaurantInfo.restaurantName}</h1>
            
            <div className="flex flex-col gap-1.5 text-xs text-slate-300 font-medium">
              <p className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-orange-500 shrink-0" /> {restaurantInfo.address}</p>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-green-500 shrink-0" /> {restaurantInfo.phone}</span>
                <span className="flex items-center gap-1 bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-md font-bold">
                  <Star className="w-3.5 h-3.5 fill-orange-500 stroke-orange-500" /> {restaurantInfo.rating?.toFixed(1) || '0.0'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-xs font-bold text-slate-300 space-y-2 shrink-0 w-full md:w-auto">
            <div className="flex justify-between md:gap-8"><span>Phí giao hàng:</span><span className="text-orange-400 font-black">{formatCurrency(restaurantInfo.deliveryFee)}</span></div>
            <div className="flex justify-between md:gap-8"><span>Đơn tối thiểu ship:</span><span className="text-slate-100 font-black">{formatCurrency(restaurantInfo.minOrderValue)}</span></div>
          </div>
        </div>
      </div>

      {/* DANH SÁCH THỰC ĐƠN MÓN ĂN */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        <h2 className="text-sm font-black text-slate-800 mb-5 tracking-wider uppercase border-b pb-3">
          🍔 Thực đơn món ăn phục vụ ({foodsList.length})
        </h2>

        {foodsList.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center shadow-xs">
            <p className="text-xs font-bold text-slate-400">Nhà hàng hiện chưa cập nhật món ăn nào lên thực đơn điện tử.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {foodsList.map((food) => (
              <MenuItemCard 
                key={food.foodId} 
                food={food} 
                deliveryFee={restaurantInfo.deliveryFee} 
              />
            ))}
          </div>
        )}
      </div>

      {/* FLOATING QUICK CHECKOUT BAR */}
      {totalCartItems > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-xl bg-slate-900 text-white rounded-2xl shadow-2xl px-5 py-4 flex items-center justify-between z-50">
          <div className="flex items-center gap-3">
            <div className="relative p-2.5 bg-orange-500 rounded-xl">
              <ShoppingBag className="w-5 h-5 text-white" />
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 border-2 border-slate-900 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                {totalCartItems}
              </span>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Giỏ hàng tạm tính</p>
              <p className="text-base font-black text-orange-400 mt-0.5">{formatCurrency(totalPrice)}</p>
            </div>
          </div>
          <button 
            // Điều hướng chuẩn xác qua trang /cart kèm state phí ship của quán để tính toán hóa đơn
            onClick={() => navigate('/cart', { state: { restaurantId, deliveryFee: restaurantInfo.deliveryFee } })}
            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black text-xs rounded-xl shadow-lg shadow-orange-500/20 transition-all uppercase tracking-wider cursor-pointer"
          >
            Thanh toán ngay
          </button>
        </div>
      )}
    </div>
  );
}