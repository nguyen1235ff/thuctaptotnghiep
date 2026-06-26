import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { restaurantService } from '../services/restaurant';
import { useCart } from '../context/CartContext';
import RestaurantCard from '../components/RestaurantCard';
import { 
  Search, Loader2, ShoppingCart, User, LogIn, 
  UserPlus, Utensils, Store, ArrowRight, LogOut 
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [username, setUsername] = useState<string | null>(null);

  // 1. Kiểm tra trạng thái đăng nhập từ localStorage giống như file Profile.tsx
  useEffect(() => {
    const savedUser = localStorage.getItem('username');
    if (savedUser) {
      setUsername(savedUser);
    }
  }, []);

  // 2. Lấy thông tin giỏ hàng từ Context để làm nút Floating Giỏ hàng nhanh
  const { cartItems } = useCart();
  const totalCartQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // 3. ĐÃ SỬA CHUẨN: Gọi đúng tên hàm `getAllRestaurants` từ file restaurant.ts của bạn
  const { data, isLoading, isError } = useQuery({
    queryKey: ['restaurants', page],
    queryFn: () => restaurantService.getAllRestaurants(page, 8),
    placeholderData: (previousData) => previousData 
  });

  // Xử lý lọc danh sách nhà hàng theo từ khóa tìm kiếm (Search Term)
  const filteredRestaurants = data?.content.filter(res => 
    res.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (res.description && res.description.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  // Giả lập danh sách món ăn gợi ý nhanh dựa vào chữ cái người dùng gõ
  const showSuggestions = searchTerm.trim().length > 0;
  const mockSuggestedFoods = [
    { id: 101, name: 'Cơm Tấm Sườn Bì Chả', restaurant: 'Cơm Tấm Phúc Lộc Thọ' },
    { id: 102, name: 'Canh Khổ Qua Nhồi Thịt', restaurant: 'Cơm Tấm Phúc Lộc Thọ' },
    { id: 103, name: 'Trà Đá Chanh Sả', restaurant: 'Cơm Tấm Phúc Lộc Thọ' },
  ].filter(food => food.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleLogout = () => {
    localStorage.removeItem('username');
    setUsername(null);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 relative">
      
      {/* TOP NAVBAR: ĐĂNG NHẬP / ĐĂNG KÝ / PROFILE */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-40 px-6 py-3 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <span className="text-xl">🚀</span>
            <span className="text-sm font-black tracking-tight text-slate-800 uppercase">
              Food<span className="text-orange-500">Express</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {username ? (
              // Trạng thái: ĐÃ ĐĂNG NHẬP THÀNH CÔNG -> Nhấn vào chuyển sang trang /profile
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-1.5 bg-slate-100 hover:bg-orange-50 border border-slate-200 text-slate-700 hover:text-orange-600 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-orange-500" />
                  Hồ sơ: {username}
                </button>
                <button 
                  onClick={handleLogout}
                  className="text-[11px] font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-0.5 cursor-pointer"
                >
                  <LogOut className="w-3 h-3" /> Đăng xuất
                </button>
              </div>
            ) : (
              // Trạng thái: CHƯA ĐĂNG NHẬP
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-bold text-xs px-3 py-1.5 transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" /> Đăng nhập
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs px-3 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Đăng ký
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* BANNER & THANH TÌM KIẾM GỢI Ý MÓN ĂN */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 py-14 px-4 shadow-inner relative">
        <div className="max-w-6xl mx-auto text-center text-white">
          <h1 className="text-2xl md:text-4xl font-extrabold mb-3">🍔 Thèm gì là có - Giao ngay trong chớp mắt</h1>
          <p className="text-orange-50 text-xs md:text-sm mb-8">Đặt món ăn trực tuyến từ các cửa hàng tại khu vực Long Bình & Thủ Đức.</p>
          
          {/* Ô Input Tìm kiếm */}
          <div className="max-w-xl mx-auto relative shadow-xl rounded-2xl z-30">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(0);
                }}
                placeholder="Tìm tên quán ăn hoặc tên món ăn ngon..."
                className="w-full bg-white text-slate-800 pl-11 pr-4 py-3 rounded-2xl text-xs font-bold focus:outline-none placeholder-slate-400 border-2 border-transparent focus:border-slate-900 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>

            {/* DROPDOWN BOX GỢI Ý MÓN ĂN KHI GÕ TỪ KHÓA */}
            {showSuggestions && (
              <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 text-left overflow-hidden z-50 animate-fadeIn">
                <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <Utensils className="w-3 h-3 text-orange-500" /> Gợi ý từ khóa món ăn phù hợp
                </div>
                
                <div className="divide-y divide-slate-50 max-h-48 overflow-y-auto">
                  {mockSuggestedFoods.length > 0 ? (
                    mockSuggestedFoods.map((food) => (
                      <div 
                        key={food.id}
                        onClick={() => setSearchTerm(food.name)}
                        className="p-3 hover:bg-orange-50/50 flex items-center justify-between cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500">
                            <Utensils className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-700 group-hover:text-orange-600 transition-colors">{food.name}</p>
                            <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                              <Store className="w-2.5 h-2.5" /> {food.restaurant}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-orange-500 transition-all transform group-hover:translate-x-1" />
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400">Không tìm thấy món ăn nào trùng khớp.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RENDER DANH SÁCH CỬA HÀNG ĐỐI TÁC */}
      <div className="max-w-6xl mx-auto px-6 mt-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            🍿 Danh sách cửa hàng ăn uống đối tác
          </h2>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-2" />
            <p className="text-xs text-slate-400 font-bold">Đang lấy dữ liệu quán ăn...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-12 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100">
            ❌ Lỗi kết nối máy chủ Backend. Vui lòng kiểm tra lại kết nối mạng!
          </div>
        ) : filteredRestaurants.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.restaurantId} restaurant={restaurant} />
              ))}
            </div>

            {/* PHÂN TRANG (PAGINATION) CHUẨN ĐƯỢC TÍNH TỪ DATA BACKEND */}
            {data && data.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(prev => Math.max(prev - 1, 0))}
                  className="px-4 py-2 border rounded-xl bg-white text-xs font-bold text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Trước
                </button>
                <span className="text-xs font-black text-slate-700 mx-2">
                  Trang {page + 1} / {data.totalPages}
                </span>
                <button
                  disabled={page >= data.totalPages - 1}
                  onClick={() => setPage(prev => prev + 1)}
                  className="px-4 py-2 border rounded-xl bg-white text-xs font-bold text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl text-xs text-slate-400 font-medium">
            Không tìm thấy nhà hàng nào phù hợp với từ khóa tìm kiếm của bạn.
          </div>
        )}
      </div>

      {/* NÚT GIỎ HÀNG NỔI (FLOATING CART) TỰ ĐỘNG HIỆN KHI CÓ MÓN ĂN */}
      {totalCartQuantity > 0 && (
        <button
          onClick={() => navigate('/cart')}
          className="fixed bottom-6 right-6 bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:bg-slate-800 transition-all transform hover:scale-105 active:scale-95 z-50 flex items-center gap-2 cursor-pointer group"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5 text-white" />
            <span className="absolute -top-2.5 -right-2.5 bg-orange-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-slate-900 group-hover:bg-orange-600 transition-colors">
              {totalCartQuantity}
            </span>
          </div>
          <span className="text-xs font-black pr-1 hidden sm:inline">Xem giỏ hàng</span>
        </button>
      )}
    </div>
  );
}