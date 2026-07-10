import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { foodService } from '../services/food';
import { categoryService } from '../services/category';
import { restaurantService } from '../services/restaurant'; // Sử dụng đúng file service nhà hàng
import { reviewService } from '../services/review';         // Import reviewService chuẩn
import { useCart } from '../context/CartContext';
import { 
  ArrowLeft, Star, Bike, Clock, 
  Plus, Minus, Utensils, Search, MessageSquare, User, Calendar, Loader2
} from 'lucide-react';

export default function CustomerRestaurantView() {
  const { id } = useParams<{ id: string }>();
  const restaurantId = Number(id);
  const navigate = useNavigate();
  
  const { cartItems, addToCart, removeFromCart, getSubtotal, getTotalItems } = useCart();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [foodSearch, setFoodSearch] = useState('');
  
  // Quản lý Tab hiển thị: Thực đơn món ăn ('MENU') hoặc Đánh giá khách hàng ('REVIEWS')
  const [activeTab, setActiveTab] = useState<'MENU' | 'REVIEWS'>('MENU');
  // Quản lý phân trang cho danh sách Đánh giá
  const [reviewPage, setReviewPage] = useState(0);
  const reviewSize = 10;

  // 1. LẤY CHI TIẾT THÔNG TIN NHÀ HÀNG (Để hiển thị Tên, Phí ship, Tỉ lệ sao thực tế từ BE)
  const { data: restaurantsData } = useQuery({
    queryKey: ['customer-restaurants'],
    queryFn: () => restaurantService.getAllRestaurants(0, 50)
  });
  
  // Tìm kiếm thông tin nhà hàng hiện tại từ danh sách trả về
  const currentRestaurant = restaurantsData?.content?.find(
    (r) => r.restaurantId === restaurantId
  );

  // 2. LẤY DANH SÁCH DANH MỤC MÓN CỦA QUÁN
  const { data: categories = [] } = useQuery({
    queryKey: ['customer-categories', restaurantId],
    queryFn: () => categoryService.getByRestaurantId(restaurantId)
  });

  // 3. LẤY DANH SÁCH MÓN ĂN
  const { data: foodData } = useQuery({
    queryKey: ['customer-foods', restaurantId],
    queryFn: () => foodService.getByRestaurantId(restaurantId)
  });
  const foods = foodData?.content || [];

  // 4. LẤY DANH SÁCH ĐÁNH GIÁ PHÂN TRANG (Gọi API chuẩn: GET /reviews/restaurant/{id})[cite: 31]
  const { data: reviewPagination, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['restaurant-reviews', restaurantId, reviewPage],
    queryFn: () => reviewService.getRestaurantReviews(restaurantId, reviewPage, reviewSize),
    enabled: activeTab === 'REVIEWS' // Chỉ kích hoạt gọi API này khi người dùng chuyển sang Tab Đánh giá
  });

  // Trích xuất an toàn danh sách mảng reviews từ PageResponse[cite: 31]
  const reviewsList = reviewPagination?.content || [];
  const totalReviewPages = reviewPagination?.totalPages || 1;

  // Lọc danh sách món ăn theo thanh tìm kiếm và bộ lọc danh mục
  const filteredFoods = foods.filter(food => {
    const matchSearch = food.foodName.toLowerCase().includes(foodSearch.toLowerCase());
    const matchCategory = selectedCategoryId ? food.categoryId === selectedCategoryId : true;
    return matchSearch && matchCategory;
  });

  // Định dạng hiển thị tiền tệ VND
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Định dạng chuỗi ngày tháng đánh giá trực quan từ ISO String
  const formatReviewDate = (dateStr: string) => {
    if (!dateStr) return 'Mới đây';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  const getItemQuantity = (foodId: number) => {
    return cartItems.find(item => item.foodId === foodId)?.quantity || 0;
  };

  // Tên nhà hàng hiển thị mặc định nếu dữ liệu BE đang tải
  const currentRestaurantName = currentRestaurant?.restaurantName || "Cửa hàng đối tác";

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* 1. STICKY HEADER TOP BAR */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30 px-4 py-3.5 shadow-xs">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-slate-700">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-black text-slate-800 text-sm tracking-wide truncate max-w-[240px]">
                {currentRestaurantName}
              </h1>
              <div className="flex items-center gap-2.5 text-[10px] text-slate-400 font-bold mt-0.5">
                <span className="flex items-center gap-0.5 text-amber-500">
                  <Star className="w-3 h-3 fill-amber-500" /> 
                  {currentRestaurant?.rating?.toFixed(1) || '0.0'} ({currentRestaurant?.totalReviews || 0})
                </span>
                <span className="flex items-center gap-0.5">
                  <Bike className="w-3 h-3" /> 
                  {formatCurrency(currentRestaurant?.deliveryFee || 15000)}
                </span>
                <span className="flex items-center gap-0.5">
                  <Clock className="w-3 h-3" /> 15-25 phút
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-4">
        {/* 2. HỆ THỐNG NAVIGATION TAB (CHUYỂN ĐỔI THỰC ĐƠN / ĐÁNH GIÁ) */}
        <div className="flex bg-slate-200/60 p-1 rounded-xl mb-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('MENU')}
            className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'MENU' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            Thực đơn món ăn
          </button>
          <button
            onClick={() => setActiveTab('REVIEWS')}
            className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'REVIEWS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Đánh giá khách hàng ({currentRestaurant?.totalReviews || reviewsList.length})
          </button>
        </div>

        {/* ----------------- TAB 1: HIỂN THỊ THỰC ĐƠN ----------------- */}
        {activeTab === 'MENU' && (
          <>
            {/* Ô tìm kiếm món ăn */}
            <div className="relative mb-4">
              <input
                type="text"
                value={foodSearch}
                onChange={(e) => setFoodSearch(e.target.value)}
                placeholder="Tìm tên món ăn ngon tại đây..."
                className="w-full bg-white border border-slate-200/80 text-slate-800 text-xs pl-10 pr-4 py-3 rounded-2xl focus:outline-none focus:border-orange-500 shadow-xs transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* Slider bộ lọc danh mục ngang */}
            {categories.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none mb-2">
                <button
                  onClick={() => setSelectedCategoryId(null)}
                  className={`px-3.5 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer border ${
                    selectedCategoryId === null
                      ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  Tất cả món
                </button>
                {categories.map((cat: any) => {
                  const catId = cat.id || cat.categoryId;
                  const catName = cat.name || cat.categoryName;
                  return (
                    <button
                      key={catId}
                      onClick={() => setSelectedCategoryId(catId)}
                      className={`px-3.5 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer border ${
                        selectedCategoryId === catId
                          ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      {catName}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Render Danh sách món ăn */}
            {filteredFoods.length > 0 ? (
              <div className="space-y-3">
                {filteredFoods.map((food) => {
                  const qty = getItemQuantity(food.foodId);
                  return (
                    <div key={food.foodId} className="bg-white border border-slate-100 p-3 rounded-2xl shadow-xs flex gap-3 items-center transition-all">
                      <img src={food.imageUrl} alt={food.foodName} className="w-20 h-20 rounded-xl object-cover bg-slate-100 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-slate-800 text-xs truncate">{food.foodName}</h3>
                        <p className="text-[10px] text-slate-400 font-medium line-clamp-2 mt-0.5 leading-relaxed">{food.description}</p>
                        <span className="text-xs font-black text-orange-500 block mt-2">{formatCurrency(food.price)}</span>
                      </div>
                      <div className="shrink-0 ml-1">
                        {qty === 0 ? (
                          <button
                            onClick={() => addToCart(food, currentRestaurantName)}
                            className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-xl shadow-xs transition-colors cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        ) : (
                          <div className="flex items-center gap-2.5 bg-slate-100 px-2 py-1.5 rounsded-xl border border-slate-200/40 text-xs font-black text-slate-800">
                            <button onClick={() => removeFromCart(food.foodId)} className="text-slate-500 hover:text-slate-800 transition-colors p-0.5 cursor-pointer"><Minus className="w-3 h-3" /></button>
                            <span className="w-3 text-center select-none text-[11px]">{qty}</span>
                            <button onClick={() => addToCart(food, currentRestaurantName)} className="text-slate-500 hover:text-slate-800 transition-colors p-0.5 cursor-pointer"><Plus className="w-3 h-3" /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-white border border-slate-100 rounded-2xl text-[11px] text-slate-400 font-medium">
                Không tìm thấy món ăn phù hợp với yêu cầu của bạn.
              </div>
            )}
          </>
        )}

        {/* ----------------- TAB 2: HIỂN THỊ DANH SÁCH ĐÁNH GIÁ ----------------- */}
        {activeTab === 'REVIEWS' && (
          <div className="space-y-4 animate-fade-in">
            {isLoadingReviews ? (
              <div className="text-center py-12 flex flex-col items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-orange-500 mb-2" />
                <span className="text-xs text-slate-400 font-bold">Đang tải nhận xét...</span>
              </div>
            ) : reviewsList.length > 0 ? (
              <>
                <div className="space-y-3">
                  {reviewsList.map((review) => (
                    <div key={review.reviewId} className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs space-y-2.5">
                      {/* Thông tin User & Số sao đánh giá */}
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="bg-slate-100 p-1.5 rounded-xl text-slate-500">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-800">
                              @{review.username || 'khach_hang_an_danh'}[cite: 31]
                            </h4>
                            <div className="flex gap-0.5 mt-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star} 
                                  className={`w-3 h-3 ${star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}[cite: 31]`} 
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        {/* Thời gian gửi đánh giá */}
                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> 
                          {formatReviewDate(review.reviewDate)}[cite: 31]
                        </span>
                      </div>

                      {/* Nội dung text nhận xét chi tiết */}
                      <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50/60 p-3 rounded-xl border border-slate-100/50">
                        {review.comment}[cite: 31]
                      </p>
                    </div>
                  ))}
                </div>

                {/* THANH CHUYỂN TRANG REVIEW (PAGINATION PANEL) */}
                {totalReviewPages > 1 && (
                  <div className="flex items-center justify-between pt-4 pb-2">
                    <button
                      onClick={() => setReviewPage(p => Math.max(0, p - 1))}
                      disabled={reviewPage === 0}
                      className="px-3 py-1.5 border border-slate-200 rounded-xl bg-white text-[11px] font-bold text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Trước
                    </button>
                    <span className="text-[11px] font-bold text-slate-500">
                      Trang {reviewPage + 1} / {totalReviewPages}
                    </span>
                    <button
                      onClick={() => setReviewPage(p => Math.min(totalReviewPages - 1, p + 1))}
                      disabled={reviewPage >= totalReviewPages - 1}
                      className="px-3 py-1.5 border border-slate-200 rounded-xl bg-white text-[11px] font-bold text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Sau
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Trạng thái trống nếu quán chưa có lượt nhận xét nào */
              <div className="text-center py-16 bg-white border border-slate-100 rounded-2xl shadow-xs text-xs text-slate-400 font-medium">
                <MessageSquare className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                Cửa hàng chưa nhận được đánh giá nào từ thực khách.
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. FLOATING BOTTOM BAR - GIỎ HÀNG THẢ NỔI KHI CÓ MÓN */}
      {getTotalItems() > 0 && (
        <div className="fixed bottom-6 left-4 right-4 z-40 animate-fade-in">
          <div 
            onClick={() => navigate('/cart')}
            className="max-w-md mx-auto bg-slate-900 text-white p-3.5 rounded-2xl flex items-center justify-between shadow-xl shadow-slate-950/20 cursor-pointer hover:bg-slate-800 transition-all transform hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3">
              <div className="bg-orange-500 text-white px-2.5 py-1 rounded-xl text-xs font-black shadow-xs">
                {getTotalItems()} món
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Xem giỏ hàng</span>
                <span className="text-xs font-black text-orange-400">{getSubtotal().toLocaleString()}đ</span>
              </div>
            </div>
            <div className="flex items-center gap-1 font-black text-xs text-white">
              Đến trang thanh toán
            </div>
          </div>
        </div>
      )}
    </div>
  );
}