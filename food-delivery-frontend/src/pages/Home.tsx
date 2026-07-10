import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { restaurantService } from '../services/restaurant';
import { useCartStore } from '../store/useCartStore'; // Chuyển sang sử dụng Zustand Store thực tế
import RestaurantCard from '../components/RestaurantCard';
import { 
  Search, Loader2, ShoppingCart, User,
  Store, ArrowRight, LogOut,
  Flame, Award, Clock, Compass, ThumbsUp
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [username, setUsername] = useState<string | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('ALL');

  // Lấy dữ liệu giỏ hàng thực tế từ Zustand Store kết nối Backend
  const cart = useCartStore((state) => state.cart);
  const fetchCart = useCartStore((state) => state.fetchCart);

  // 1. Đồng bộ trạng thái đăng nhập tài khoản và nạp giỏ hàng thực tế tự động
  useEffect(() => {
    const savedUser = localStorage.getItem('username');
    if (savedUser) {
      setUsername(savedUser);
      fetchCart(); // Nạp giỏ hàng từ DB Backend lên nếu đã đăng nhập
    }
  }, [fetchCart]);

  // Tính toán tổng số lượng món ăn thực tế đang có trong giỏ hàng tổng thể
  const totalCartQuantity = Object.values(cart).reduce(
    (sum, items) => sum + items.reduce((s, item) => s + item.quantity, 0), 0
  );

  // 2. CALL API: Lấy danh sách toàn bộ nhà hàng phân trang thực tế từ Backend
  const { data, isLoading, isError } = useQuery({
    queryKey: ['restaurants', page],
    queryFn: () => restaurantService.getAllRestaurants(page, 8),
    placeholderData: (previousData) => previousData 
  });

  // Xử lý lọc danh sách nhà hàng động theo từ khóa người dùng nhập vào
  const filteredRestaurants = data?.content.filter(res => 
    res.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (res.description && res.description.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  // Xử lý đăng xuất triệt để xóa sạch bộ nhớ đệm an toàn
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    localStorage.removeItem('roles');
    useCartStore.getState().clearCart(); // Xóa trạng thái giỏ hàng local
    setUsername(null);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 font-sans">
      
      {/* HEADER TOP NAVBAR - THIẾT KẾ ĐỘC QUYỀN HIỆN ĐẠI */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 px-4 sm:px-6 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md shadow-orange-500/20">🚀</div>
            <span className="text-base font-black tracking-tight text-slate-800 uppercase">
              Food<span className="text-orange-500">Express</span>
            </span>
          </div>

          {/* THANH TÌM KIẾM MINI TRÊN NAVBAR KHI CUỘN CHUỘT */}
          <div className="hidden md:flex items-center relative w-96">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
              placeholder="Tìm quán ăn, món ngon vùng Long Bình..."
              className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500 transition-all placeholder:text-slate-400 text-slate-700"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-4">
            {username ? (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm"
                >
                  <User className="w-3.5 h-3.5 text-orange-400" />
                  Hồ sơ: {username}
                </button>
                <button 
                  onClick={handleLogout}
                  className="text-xs font-black text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1 cursor-pointer bg-slate-100 px-3 py-2 rounded-xl border"
                >
                  <LogOut className="w-3.5 h-3.5" /> Rời khỏi
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-black text-xs px-3 py-2 transition-colors cursor-pointer"
                >
                  Đăng nhập
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Đăng ký đối tác
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* HERO BANNER SÀN THƯƠNG MẠI ẨM THỰC PREMIUM */}
      <div className="bg-gradient-to-br from-slate-900 via-orange-950 to-slate-900 py-16 px-4 relative overflow-hidden shadow-md">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-4xl mx-auto text-center text-white relative z-10 space-y-4">
          <span className="bg-orange-500/20 text-orange-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-orange-500/30">
            ⚡ Siêu tốc giao hàng 15 phút
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Thèm gì là có - FoodExpress giao ngay <br />
            Trong <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">Chớp Mắt</span>
          </h1>
          <p className="text-slate-300 text-xs md:text-sm max-w-xl mx-auto font-medium leading-relaxed">
            Khám phá tinh hoa ẩm thực, món ăn đặc sản, cơm văn phòng thơm ngon chuẩn vị được giao tận cửa phòng của bạn tại khu vực Long Bình.
          </p>
          
          {/* THANH TÌM KIẾM LỚN TRUNG TÂM */}
          <div className="max-w-xl mx-auto pt-4">
            <div className="relative shadow-2xl rounded-2xl bg-white p-1.5 flex items-center">
              <div className="flex items-center flex-1 pl-3">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                  placeholder="Tìm tên cửa hàng, trà sữa, gà rán ngon..."
                  className="w-full bg-transparent text-slate-800 pl-3 pr-2 py-2 text-xs font-bold focus:outline-none placeholder:text-slate-400"
                />
              </div>
              <button className="bg-orange-500 hover:bg-orange-600 text-white font-black text-xs px-6 py-2.5 rounded-xl transition-all shadow-md shrink-0 cursor-pointer">
                Tìm kiếm
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DANH MỤC ẨM THỰC NHANH (QUICK CATEGORIES FILTERS) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {([
            { id: 'ALL', label: '🍱 Tất cả món', icon: Compass },
            { id: 'PROMO', label: '🔥 Khuyến mãi siêu rẻ', icon: Flame },
            { id: 'TRENDING', label: '👑 Quán phổ biến nhất', icon: Award },
            { id: 'NEARBY', label: '🚀 Giao nhanh gần bạn', icon: Clock },
            { id: 'RATING', label: '👍 Đánh giá 5 sao', icon: ThumbsUp }
          ]).map((cat) => {
            const IconComponent = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryFilter(cat.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap border transition-all cursor-pointer shadow-xs ${
                  activeCategoryFilter === cat.id 
                    ? 'bg-orange-500 border-orange-500 text-white shadow-orange-500/10' 
                    : 'bg-white border-slate-200/60 text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <IconComponent className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* KHU VỰC RENDER DANH SÁCH NHÀ HÀNG ĐỐI TÁC THỰC TẾ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Store className="w-4 h-4 text-orange-500" /> Gian hàng ăn uống đối tác chính thức
            </h2>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide mt-0.5">Danh sách các quán ăn đang hoạt động thực tế trên hệ thống</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            <p className="text-xs text-slate-400 font-bold">Đang tải danh sách gian hàng...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-12 bg-red-50 text-red-600 rounded-3xl text-xs font-bold border border-red-100 shadow-xs max-w-xl mx-auto">
            ❌ Không thể kết nối đến máy chủ máy chủ Backend. Vui lòng bật Server Spring Boot và thử lại!
          </div>
        ) : filteredRestaurants.length > 0 ? (
          <>
            {/* GRID DANH SÁCH QUÁN ĂN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.restaurantId} restaurant={restaurant} />
              ))}
            </div>

            {/* THANH ĐIỀU HƯỚNG PHÂN TRANG CHUẨN JPA TỪ BACKEND DATA */}
            {data && data.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12 border-t border-slate-100 pt-6">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(prev => Math.max(prev - 1, 0))}
                  className="px-4 py-2 border border-slate-200 rounded-xl bg-white text-xs font-bold text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Trước
                </button>
                <span className="text-xs font-black text-slate-500 mx-3">
                  Trang {page + 1} / {data.totalPages}
                </span>
                <button
                  disabled={page >= data.totalPages - 1}
                  onClick={() => setPage(prev => prev + 1)}
                  className="px-4 py-2 border border-slate-200 rounded-xl bg-white text-xs font-bold text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl text-xs text-slate-400 font-bold max-w-xl mx-auto shadow-xs">
            🦖 Không tìm thấy nhà hàng nào phù hợp với từ khóa tìm kiếm hiện tại.
          </div>
        )}
      </div>

      {/* NÚT FLOAT GIỎ HÀNG THÔNG MINH (FLOATING QUICK CART) */}
      {totalCartQuantity > 0 && (
        <button
          onClick={() => navigate('/cart')}
          className="fixed bottom-6 right-6 bg-slate-900 hover:bg-orange-600 text-white pl-4 pr-5 py-3.5 rounded-full shadow-2xl transition-all transform hover:scale-105 active:scale-95 z-50 flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="relative">
            <ShoppingCart className="w-4 h-4 text-white" />
            <span className="absolute -top-3.5 -right-3 bg-orange-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-slate-900 group-hover:bg-slate-900 transition-colors">
              {totalCartQuantity}
            </span>
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-[11px]">Xem giỏ hàng hàng ngay</span>
          <ArrowRight className="w-3.5 h-3.5 text-orange-400 group-hover:text-white transition-colors" />
        </button>
      )}
    </div>
  );
}