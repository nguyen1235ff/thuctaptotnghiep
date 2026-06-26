import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { foodService } from '../services/food';
import { categoryService } from '../services/category';
import { useCart } from '../context/CartContext';
import { 
  ArrowLeft, Star, Bike, Clock, ShoppingBag, 
  Plus, Minus, Utensils, Search 
} from 'lucide-react';

export default function CustomerRestaurantView() {
  const { id } = useParams<{ id: string }>();
  const restaurantId = Number(id);
  const navigate = useNavigate();
  
  const { cartItems, addToCart, removeFromCart, getSubtotal, getTotalItems } = useCart();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [foodSearch, setFoodSearch] = useState('');

  // Giả lập lấy thông tin chi tiết nhà hàng (bạn có thể map với restaurantService.getById sau này)
  // Hiện tại lấy tên mặc định từ logic bọc hoặc context để hiển thị
  const restaurantName = "Cửa hàng đối tác"; 

  // 1. LẤY DANH SÁCH DANH MỤC MÓN CỦA QUÁN (Trả về mảng phẳng)
  const { data: categories = [] } = useQuery({
    queryKey: ['customer-categories', restaurantId],
    queryFn: () => categoryService.getByRestaurantId(restaurantId)
  });

  // 2. LẤY DANH SÁCH MÓN ĂN (Trả về PageResponse phân trang)
  const { data: foodPage, isLoading } = useQuery({
    queryKey: ['customer-foods', restaurantId],
    queryFn: () => foodService.getByRestaurantId(restaurantId, 0, 50) // Lấy tối đa 50 món để hiển thị thực đơn công khai
  });

  const allFoods = foodPage?.content || [];

  // Lọc món ăn theo Tab Danh mục được chọn và Từ khóa tìm kiếm món
  const filteredFoods = allFoods.filter(food => {
    const matchCategory = selectedCategoryId ? food.categoryId === selectedCategoryId : true;
    const matchSearch = food.name.toLowerCase().includes(foodSearch.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Hàm tiện ích lấy số lượng hiện tại của món ăn này trong giỏ hàng để render nút bấm
  const getItemQuantity = (foodId: number) => {
    const item = cartItems.find(i => i.foodId === foodId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-28">
      
      {/* 1. HEADER BAR CỐ ĐỊNH PHÍA TRÊN */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30 px-4 py-3 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate('/')} 
            className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-sm font-black text-slate-800 truncate max-w-[200px] sm:max-w-none">
            {restaurantName}
          </h2>
          <div className="w-9 h-9"></div> {/* Giữ cân bằng layout */}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        
        {/* 2. MINI BANNER THÔNG TIN QUÁN */}
        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-xs flex flex-col sm:flex-row justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-xl font-black text-slate-900">{restaurantName}</h1>
            <div className="flex items-center gap-1 text-xs text-slate-500 font-bold">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-slate-800">4.5</span>
              <span>(100+ đánh giá)</span>
              <span>•</span>
              <span className="text-orange-600">Đang mở cửa</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-100/60 w-max sm:self-center">
            <div className="flex items-center gap-1">
              <Bike className="w-4 h-4 text-orange-500" />
              <span>Giao hàng: <b className="text-slate-800">15.000đ</b></span>
            </div>
            <div className="h-4 w-px bg-slate-200"></div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>15-25 phút</span>
            </div>
          </div>
        </div>

        {/* 3. THANH TÌM KIẾM MÓN ĂN TRONG QUÁN */}
        <div className="bg-white border border-slate-100 p-2 rounded-2xl shadow-xs flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400 ml-2" />
          <input 
            type="text"
            placeholder="Tìm nhanh món ăn trong thực đơn của quán..."
            value={foodSearch}
            onChange={(e) => setFoodSearch(e.target.value)}
            className="w-full bg-transparent border-none text-xs font-bold text-slate-800 focus:outline-none placeholder-slate-400"
          />
        </div>

        {/* 4. THANH CHỌN TAB DANH MỤC MÓN (HORIZONTAL CATEGORY TAB) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedCategoryId(null)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap shrink-0 ${
              selectedCategoryId === null 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'bg-white border border-slate-200/60 text-slate-600 hover:bg-slate-50'
            }`}
          >
            📋 Tất cả thực đơn
          </button>
          
          {categories.map((cat) => (
            <button
              key={cat.categoryId}
              onClick={() => setSelectedCategoryId(cat.categoryId)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap shrink-0 ${
                selectedCategoryId === cat.categoryId 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'bg-white border border-slate-200/60 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat.categoryName}
            </button>
          ))}
        </div>

        {/* 5. GIAN HIỂN THỊ DANH SÁCH MÓN ĂN */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(n => (
              <div key={n} className="bg-white h-24 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredFoods.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center space-y-2">
            <Utensils className="w-7 h-7 text-slate-200 mx-auto" />
            <h4 className="text-xs font-bold text-slate-600">Thực đơn tạm thời trống</h4>
            <p className="text-[10px] text-slate-400">Quán chưa cập nhật món ăn nào trong danh mục này.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFoods.map((food) => {
              const quantity = getItemQuantity(food.foodId);
              
              return (
                <div 
                  key={food.foodId}
                  className="bg-white border border-slate-100 p-3 rounded-2xl shadow-xs flex gap-4 items-center justify-between group hover:border-slate-200 transition-all"
                >
                  {/* Khối thông tin món bên trái */}
                  <div className="flex gap-3 items-center overflow-hidden">
                    <div className="w-16 h-16 bg-slate-50 rounded-xl overflow-hidden shrink-0">
                      <img 
                        src={food.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200"} 
                        alt={food.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-black text-slate-800 truncate">{food.name}</h4>
                      <p className="text-[10px] text-slate-400 font-medium line-clamp-1 mt-0.5">{food.description}</p>
                      <span className="text-xs font-black text-orange-500 block mt-1">
                        {food.price.toLocaleString()}đ
                      </span>
                    </div>
                  </div>

                  {/* Khối cụm nút tăng/giảm số lượng bên phải */}
                  <div className="shrink-0">
                    {quantity === 0 ? (
                      <button
                        onClick={() => addToCart(food, restaurantName)}
                        className="p-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200/40">
                        <button
                          onClick={() => removeFromCart(food.foodId)}
                          className="p-1 bg-white hover:bg-slate-50 rounded-lg text-slate-600 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-black text-slate-800 min-w-[14px] text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() => addToCart(food, restaurantName)}
                          className="p-1 bg-white hover:bg-slate-50 rounded-lg text-slate-600 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. FLOATING BOTTOM BAR - GIỎ HÀNG THẢ NỔI KHI CÓ MÓN */}
      {getTotalItems() > 0 && (
        <div className="fixed bottom-6 left-4 right-4 z-40 animate-fade-in">
          <div 
            onClick={() => navigate('/cart')}
            className="max-w-md mx-auto bg-slate-900 text-white p-3.5 rounded-2xl flex items-center justify-between shadow-xl shadow-slate-950/20 cursor-pointer hover:bg-slate-800 transition-all transform hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3">
              <div className="bg-orange-500 text-white px-2.5 py-1 rounded-xl text-xs font-black shadow-sm">
                {getTotalItems()} món
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Xem giỏ hàng</span>
                <span className="text-xs font-black text-orange-400">{getSubtotal().toLocaleString()}đ</span>
              </div>
            </div>
            <div className="flex items-center gap-1 font-black text-xs text-white">
              Đến trang thanh toán
              <ShoppingBag className="w-4 h-4 text-orange-400 fill-orange-400" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}