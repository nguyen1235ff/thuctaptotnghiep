import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCartStore } from '../store/useCartStore'; // Chuyển từ Context cũ sang useCartStore chuẩn
import { orderService, type CreateOrderRequest } from '../services/order';
import { voucherService } from '../services/voucher';
import { 
  ArrowLeft, MapPin, Phone, FileText, ShoppingBag, 
  Trash2, Ticket, CreditCard, Loader2, CheckCircle2 
} from 'lucide-react';

export default function Cart() {
  const navigate = useNavigate();
  const location = useLocation();

  // Nhận thông tin ID nhà hàng và phí giao hàng thực tế từ trang RestaurantDetail truyền sang
  const stateRestaurantId = location.state?.restaurantId ? Number(location.state.restaurantId) : null;

  // Đồng bộ hóa trạng thái giỏ hàng thực tế từ Zustand Store
  const cart = useCartStore((state) => state.cart);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const updateCartItem = useCartStore((state) => state.updateCartItem);
  const clearCart = useCartStore((state) => state.clearCart);

  // Tự động nạp dữ liệu giỏ hàng thực tế từ DB Backend khi vào trang thanh toán
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // State thông tin giao nhận dữ liệu khách hàng thực tế (Địa chỉ lấy theo khu vực Long Bình của bạn)
  const [address, setAddress] = useState('Phường Long Bình, Thành phố Thủ Đức, TP. HCM');
  const [phone, setPhone] = useState('0987654321');
  const [notes, setNotes] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<any | null>(null);
  const [isCheckingVoucher, setIsCheckingVoucher] = useState(false);

  // Lấy ra danh sách món ăn thuộc nhà hàng này từ giỏ hàng cấu trúc mới
  // Nếu không có stateRestaurantId truyền sang, tự động lấy danh mục quán đầu tiên có món trong giỏ
  const currentRestaurantId = stateRestaurantId || Number(Object.keys(cart).find(id => cart[Number(id)].length > 0)) || 0;
  const cartItems = cart[currentRestaurantId] || [];

  // Tính toán chi phí dựa hoàn toàn trên dữ liệu đồng bộ của Backend
  const subtotal = useCartStore((state) => state.totalPrice); 
  // Bạn có thể truyền deliveryFee thực tế của nhà hàng sang, mặc định dự phòng 15.000đ nếu không tìm thấy state
  const deliveryFee = subtotal > 0 ? (location.state?.deliveryFee || 15000) : 0; 

  // 1. CALL API: Lấy danh sách các voucher có sẵn trên hệ thống để gợi ý cho khách
  const { data: voucherPage } = useQuery({
    queryKey: ['available-vouchers'],
    queryFn: () => voucherService.getAllAvailable(0, 10),
    enabled: subtotal > 0
  });
  const availableVouchers = voucherPage?.content || [];

  // 2. CALL API: Kiểm tra và áp dụng mã giảm giá trực tiếp từ Database
  const handleApplyVoucher = async (code: string) => {
    if (!code.trim()) {
      alert('⚠️ Vui lòng nhập mã voucher!');
      return;
    }

    setIsCheckingVoucher(true);
    try {
      const voucher = await voucherService.getByCode(code.trim().toUpperCase());
      
      if (!voucher) {
        alert('❌ Mã giảm giá không tồn tại!');
        return;
      }
      if (!voucher.isActive) {
        alert('❌ Mã giảm giá này hiện tại đang tạm khóa hoặc không hoạt động!');
        return;
      }
      if (subtotal < voucher.minOrderValue) {
        alert(`⚠️ Đơn hàng chưa đạt giá trị tối thiểu ${voucher.minOrderValue.toLocaleString()}đ để áp dụng mã này!`);
        return;
      }

      setAppliedVoucher(voucher);
      setVoucherCode(voucher.voucherCode);
      alert(`🎉 Áp dụng mã ${voucher.voucherCode} thành công!`);
    } catch (error) {
      console.error(error);
      alert('❌ Không tìm thấy mã giảm giá này trên hệ thống hoặc đã hết hạn!');
    } finally {
      setIsCheckingVoucher(false);
    }
  };

  // Tính toán số tiền giảm giá dựa theo cấu trúc dữ liệu VoucherResponse chuẩn từ BE
  const discount = appliedVoucher 
    ? (appliedVoucher.discountType === 'FIXED_AMOUNT' 
        ? appliedVoucher.discountValue 
        : (subtotal * appliedVoucher.discountValue) / 100)
    : 0;

  const totalAmount = Math.max(0, subtotal + deliveryFee - discount);

  // 3. MUTATION: GỬI ĐƠN HÀNG LÊN BACKEND SPRING BOOT (Xóa bỏ hoàn toàn dữ liệu giả lập)
  const createOrderMutation = useMutation({
    mutationFn: (newOrder: CreateOrderRequest) => orderService.createOrder(newOrder),
    onSuccess: async () => {
      await clearCart(); // Xóa sạch giỏ hàng trong Database thông qua API sau khi đặt thành công
      alert('🚀 Đặt hàng thành công! Đơn hàng của bạn đang chờ nhà hàng tiếp nhận.');
      navigate('/customer/orders'); // Điều hướng tới trang lịch sử đơn hàng thực tế
    },
    onError: (error: any) => {
      console.error(error);
      alert(error?.response?.data?.message || '❌ Đặt hàng thất bại. Vui lòng kiểm tra lại thông tin đơn hàng!');
    }
  });

  const handleCheckout = () => {
    if (!address.trim()) return alert('⚠️ Vui lòng nhập địa chỉ giao hàng!');
    if (!phone.trim()) return alert('⚠️ Vui lòng nhập số điện thoại liên hệ!');

    const payload: CreateOrderRequest = {
      deliveryAddress: address.trim(),
      deliveryPhone: phone.trim(),
      voucherCode: appliedVoucher ? appliedVoucher.voucherCode : undefined,
      paymentMethod: 'COD', 
      notes: notes.trim() ? notes.trim() : undefined
    };

    createOrderMutation.mutate(payload);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Giao diện khi giỏ hàng trống thực tế
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h3 className="text-sm font-black text-slate-800">Giỏ hàng của bạn đang trống!</h3>
        <p className="text-[11px] text-slate-400 mt-1 max-w-xs">Hãy quay lại trang chủ chọn cho mình những món ăn ngon lấp đầy bụng đói nhé.</p>
        <button 
          onClick={() => navigate('/')}
          className="mt-6 bg-slate-900 text-white font-black text-xs px-6 py-2.5 rounded-xl cursor-pointer"
        >
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      
      {/* HEADER BAR */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30 px-4 py-3 shadow-xs">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => currentRestaurantId ? navigate(`/customer/restaurant/${currentRestaurantId}`) : navigate('/')} 
            className="p-2 hover:bg-slate-50 rounded-xl text-slate-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-sm font-black text-slate-800">Xác nhận thanh toán</h2>
          <div className="w-9 h-9"></div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 mt-6 space-y-4">
        
        {/* TÊN NHÀ HÀNG ĐANG ĐẶT ĐƠN */}
        <div className="bg-orange-500 text-white p-3 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="overflow-hidden">
            <span className="text-[10px] text-orange-100 font-bold block uppercase tracking-wider">Đơn hàng từ cửa hàng</span>
            <h3 className="text-xs font-black truncate">
              {cartItems[0]?.restaurantName || 'Nhà hàng hệ thống'}
            </h3>
          </div>
          <ShoppingBag className="w-4 h-4 text-orange-200 shrink-0" />
        </div>

        {/* DANH SÁCH MÓN ĂN ĐƯỢC ĐỒNG BỘ TỪ BACKEND CART ITEM */}
        <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-xs space-y-3">
          <h4 className="text-xs font-black text-slate-800 border-b border-slate-50 pb-2">Danh sách món ăn chọn</h4>
          
          <div className="divide-y divide-slate-50 max-h-52 overflow-y-auto no-scrollbar">
            {cartItems.map((item) => (
              <div key={item.cartItemId} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 bg-slate-50 rounded-lg overflow-hidden shrink-0 border">
                    <img src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100"} alt={item.foodName} className="w-full h-full object-cover" />
                  </div>
                  <div className="overflow-hidden">
                    {/* Đã sửa chính xác tên trường sang .foodName và số lượng .quantity */}
                    <h5 className="text-xs font-bold text-slate-800 truncate">{item.foodName}</h5>
                    <span className="text-[10px] text-slate-400 font-medium">Số lượng: x{item.quantity}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {/* Sử dụng đơn giá thực tế từ Backend tính toán thành tiền */}
                  <span className="text-xs font-black text-slate-800">{formatCurrency(item.totalPrice || (item.unitPrice * item.quantity))}</span>
                  <button 
                    onClick={() => updateCartItem(item.cartItemId, 0)} // Truyền 0 để xóa món ăn khỏi giỏ hàng Database
                    className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* THÔNG TIN GIAO NHẬN HÀNG */}
        <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-xs space-y-3">
          <h4 className="text-xs font-black text-slate-800 border-b border-slate-50 pb-2">Thông tin giao nhận hàng</h4>
          
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3 text-orange-500" /> Địa chỉ nhận hàng
              </label>
              <input 
                type="text" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Nhập số nhà, tên đường, khu vực..."
                className="w-full bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Phone className="w-3 h-3 text-green-500" /> Số điện thoại liên hệ
              </label>
              <input 
                type="text" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại người nhận đơn..."
                className="w-full bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <FileText className="w-3 h-3 text-slate-500" /> Ghi chú tài xế / nhà hàng
              </label>
              <input 
                type="text" 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ví dụ: Giao cổng sau, không bỏ hành..."
                className="w-full bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* KHỐI NHẬP MÃ GIẢM GIÁ (VOUCHER SECTION) */}
        <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-xs space-y-3">
          <h4 className="text-xs font-black text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-1">
            <Ticket className="w-4 h-4 text-orange-500" /> Ưu đãi giảm giá khuyến mãi
          </h4>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Nhập mã ưu đãi khuyến mãi..."
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl text-xs font-black text-slate-800 uppercase focus:outline-none"
            />
            <button 
              onClick={() => handleApplyVoucher(voucherCode)}
              disabled={isCheckingVoucher}
              className="bg-slate-900 text-white font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1"
            >
              {isCheckingVoucher && <Loader2 className="w-3 h-3 animate-spin" />}
              Áp dụng
            </button>
          </div>

          {availableVouchers.length > 0 && (
            <div className="pt-1 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400">Voucher gợi ý cho bạn:</span>
              <div className="flex flex-wrap gap-1.5">
                {availableVouchers.map(v => (
                  <button
                    key={v.voucherId}
                    onClick={() => { setVoucherCode(v.voucherCode); handleApplyVoucher(v.voucherCode); }}
                    className="bg-slate-50 hover:bg-orange-50 border border-slate-200 text-[10px] font-black text-slate-700 hover:text-orange-600 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    🎫 {v.voucherCode}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* KHỐI CHI PHÍ TỔNG HỢP HÓA ĐƠN THỰC TẾ (SUMMARY BILL) */}
        <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-xs space-y-2.5 text-xs font-bold text-slate-500">
          <div className="flex justify-between items-center">
            <span>Tạm tính tiền món ăn:</span>
            <span className="text-slate-800 font-black">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Phí vận chuyển giao hàng:</span>
            <span className="text-slate-800 font-black">+{formatCurrency(deliveryFee)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between items-center text-green-600">
              <span>Khuyến mãi giảm trừ (Voucher):</span>
              <span className="font-black">-{formatCurrency(discount)}</span>
            </div>
          )}
          <div className="h-px bg-slate-100 my-1"></div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-800 font-black">Tổng thanh toán đơn hàng:</span>
            <span className="text-orange-500 font-black text-base">{formatCurrency(totalAmount)}</span>
          </div>

          <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl flex items-center justify-between text-[11px] text-slate-500 mt-2">
            <span className="flex items-center gap-1 font-bold"><CreditCard className="w-3.5 h-3.5 text-slate-600" /> Phương thức thanh toán:</span>
            <span className="font-black text-slate-800 uppercase bg-white border px-2 py-0.5 rounded-md">Tiền mặt (COD)</span>
          </div>
        </div>

        {/* NÚT THANH TOÁN */}
        <button
          onClick={handleCheckout}
          disabled={createOrderMutation.isPending}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white font-black py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer text-xs"
        >
          {createOrderMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Đang tiến hành xử lý đơn hàng...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" /> Xác nhận đặt hàng ngay
            </>
          )}
        </button>

      </div>
    </div>
  );
}