import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { restaurantService } from '../../services/restaurant'; // Sử dụng chính xác restaurantService đồng bộ mới

// --- IMPORT CÁC TRANG NHÁNH (TAB COMPONENTS) THƯ MỤC RESTAURAUNT ---
import RestaurantOverviewTab from './RestaurantOverviewTab';
import RestaurantOrdersTab from './RestaurantOrdersTab';
import RestaurantDetailView from '../admin/RestaurantDetailView'; // Giữ đúng đường dẫn view cũ của bạn

import { 
  Store, ShoppingBag, Utensils, Star, 
  CheckCircle, XCircle, ShieldAlert, Loader2
} from 'lucide-react';

type RestaurantTab = 'OVERVIEW' | 'MENU' | 'ORDERS';

export default function RestaurantDashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<RestaurantTab>('OVERVIEW');

  // 1. CALL API: Lấy duy nhất nhà hàng mà tài khoản Merchant đang sở hữu từ Backend
  const { data: myRestaurantPage, isLoading, isError } = useQuery({
    queryKey: ['my-restaurant'],
    queryFn: () => restaurantService.getMyRestaurants(0, 1)
  });

  // Bóc tách an toàn thực thể nhà hàng đầu tiên từ Spring Boot PageResponse
  const restaurant = myRestaurantPage?.content?.[0];

  // 2. MUTATION: Bật/Tắt nhanh trạng thái đóng mở cửa hàng tương tác trực tiếp lên Backend
  const toggleActiveMutation = useMutation({
    mutationFn: (payload: { id: number; isActive: boolean }) => 
      restaurantService.updateRestaurant(payload.id, { isActive: payload.isActive }),
    onSuccess: () => {
      // Làm mới dữ liệu gian hàng ngay lập tức khi cập nhật thành công
      queryClient.invalidateQueries({ queryKey: ['my-restaurant'] });
    }
  });

  const handleToggleActive = () => {
    if (!restaurant) return;
    toggleActiveMutation.mutate({
      id: restaurant.restaurantId,
      isActive: !restaurant.isActive
    });
  };

  // --- TRẠNG THÁI LOADING TOÀN TRANG CHỜ KẾT NỐI API BE ---
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
          <span className="text-xs font-bold text-slate-400">Đang đồng bộ dữ liệu gian hàng...</span>
        </div>
      </div>
    );
  }

  // --- TRẠNG THÁI LỖI HOẶC TÀI KHOẢN KHÔNG PHẢI ĐỐI TÁC GIAN HÀNG ---
  if (isError || !restaurant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
        <div className="bg-red-50 p-3 rounded-2xl border border-red-100 text-red-500 mb-3">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-sm font-black text-slate-800">Tài khoản chưa liên kết gian hàng</h3>
        <p className="text-[11px] text-slate-400 text-center max-w-xs mt-1 leading-relaxed">
          Hệ thống không tìm thấy nhà hàng nào thuộc quyền sở hữu của bạn hoặc kết nối máy chủ thất bại. Vui lòng liên hệ quản trị viên để thiết lập thông tin.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      
      {/* ============================================================== */}
      {/* SIDEBAR NAVIGATION - THANH ĐIỀU HƯỚNG BÊN TRÁI                   */}
      {/* ============================================================== */}
      <div className="w-64 bg-white border-r border-slate-200/50 flex flex-col justify-between p-4 shrink-0 h-screen sticky top-0">
        <div>
          {/* Badge Thông tin Mini quán */}
          <div className="flex items-center gap-3 px-2 py-3 bg-slate-50 rounded-2xl mb-6 border border-slate-100">
            <div className="w-9 h-9 bg-slate-900 text-white flex items-center justify-center rounded-xl font-black text-sm uppercase">
              {restaurant.restaurantName.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-black text-slate-800 truncate uppercase">{restaurant.restaurantName}</h4>
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                {/* ✅ Sử dụng cú pháp an toàn để tránh crash khi rating trống */}
                <span className="text-[10px] font-bold text-slate-500">
                  {restaurant.rating?.toFixed(1) || '0.0'} ({restaurant.totalReviews || 0} đánh giá)
                </span>
              </div>
            </div>
          </div>

          {/* Danh sách các Tab liên kết */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('OVERVIEW')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'OVERVIEW' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Store className="w-4 h-4" />
              Tổng quan & Cấu hình
            </button>

            <button
              onClick={() => setActiveTab('MENU')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'MENU' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Utensils className="w-4 h-4" />
              Quản lý thực đơn
            </button>

            <button
              onClick={() => setActiveTab('ORDERS')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'ORDERS' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              Đơn hàng vận hành
            </button>
          </nav>
        </div>

        {/* Chân trang Sidebar */}
        <div className="text-[10px] text-slate-400 font-bold text-center border-t border-slate-100 pt-3 uppercase tracking-wider">
          MERN Restaurant Portal
        </div>
      </div>

      {/* ============================================================== */}
      {/* MAIN VIEW AREA - VÙNG HIỂN THỊ NỘI DUNG CHÍNH CỦA TAB TƯƠNG ỨNG  */}
      {/* ============================================================== */}
      <div className="flex-1 overflow-y-auto h-screen p-8">
        
        {/* THANH HEADER CHUNG CHỨA NÚT TOGGLE TRẠNG THÁI */}
        <div className="flex justify-between items-center pb-6 mb-6 border-b border-slate-200/60">
          <div>
            <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest block">Khu vực đối tác</span>
            <h2 className="text-lg font-black text-slate-800">
              {activeTab === 'OVERVIEW' && '⚙️ Thiết lập cấu hình vận hành'}
              {activeTab === 'MENU' && '🍔 Quản lý danh mục & Món ăn'}
              {activeTab === 'ORDERS' && '📦 Sàn xử lý đơn hàng trực tuyến'}
            </h2>
          </div>

          {/* Công tắc đóng mở cửa hàng tương tác trực tiếp lên Backend */}
          <button 
            onClick={handleToggleActive}
            disabled={toggleActiveMutation.isPending}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-black shadow-sm transition-all border cursor-pointer ${
              restaurant.isActive 
                ? 'bg-green-50/60 text-green-600 border-green-200 hover:bg-green-100/60' 
                : 'bg-red-50/60 text-red-600 border-red-200 hover:bg-red-100/60'
            }`}
          >
            {toggleActiveMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : restaurant.isActive ? (
              <CheckCircle className="w-3.5 h-3.5" />
            ) : (
              <XCircle className="w-3.5 h-3.5" />
            )}
            {restaurant.isActive ? 'QUÁN ĐANG MỞ CỬA' : 'QUÁN ĐANG ĐÓNG CỬA'}
          </button>
        </div>

        {/* NỘI DUNG CHI TIẾT TỪNG TAB */}
        <div className="animate-fade-in">
          
          {/* TAB 1: TỔNG QUAN & FORM SỬA THÔNG TIN */}
          {activeTab === 'OVERVIEW' && (
            <RestaurantOverviewTab restaurant={restaurant} />
          )}

          {/* TAB 2: QUẢN LÝ THỰC ĐƠN */}
          {activeTab === 'MENU' && (
            <RestaurantDetailView 
              restaurantId={restaurant.restaurantId} 
              restaurantName={restaurant.restaurantName}
              onBack={() => setActiveTab('OVERVIEW')} 
            />
          )}

          {/* TAB 3: DANH SÁCH ĐƠN HÀNG VẬN HÀNH (Đã đồng bộ) */}
          {activeTab === 'ORDERS' && (
            <RestaurantOrdersTab restaurantId={restaurant.restaurantId} />
          )}

        </div>
      </div>

    </div>
  );
}