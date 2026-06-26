import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCart } from '../context/CartContext';
import { orderService, type CreateOrderRequest } from '../services/order';
import { voucherService } from '../services/voucher';
import { 
  ArrowLeft, MapPin, Phone, FileText, ShoppingBag, 
  Trash2, Ticket, CreditCard, Loader2, CheckCircle2 
} from 'lucide-react';

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, restaurantName, restaurantId, getSubtotal, clearCart, removeFromCart } = useCart();

  // State thông tin giao nhận dữ liệu khách hàng
  const [address, setAddress] = useState('Phường Long Bình, Thành phố Thủ Đức, TP. HCM');
  const [phone, setPhone] = useState('0987654321');
  const [notes, setNotes] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<any | null>(null);
  const [isCheckingVoucher, setIsCheckingVoucher] = useState(false);

  const subtotal = getSubtotal();
  const deliveryFee = subtotal > 0 ? 15000 : 0; 

  // 1. ĐÃ SỬA: Gọi chuẩn xác hàm getAllAvailable từ voucher.ts của bạn
  const { data: voucherPage } = useQuery({
    queryKey: ['available-vouchers'],
    queryFn: () => voucherService.getAllAvailable(0, 10),
    enabled: subtotal > 0
  });
  const availableVouchers = voucherPage?.content || [];

  // 2. ĐÃ SỬA: Gọi chuẩn xác hàm getByCode từ voucher.ts của bạn khi bấm nút Áp dụng
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

  // Tính toán số tiền giảm giá dựa theo cấu trúc dữ liệu VoucherResponse
  const discount = appliedVoucher 
    ? (appliedVoucher.discountType === 'FIXED_AMOUNT' 
        ? appliedVoucher.discountValue 
        : (subtotal * appliedVoucher.discountValue) / 100)
    : 0;

  const totalAmount = Math.max(0, subtotal + deliveryFee - discount);

  // 3. MUTATION GỬI ĐƠN HÀNG LÊN BACKEND SPRING BOOT
  const createOrderMutation = useMutation({
    mutationFn: (newOrder: CreateOrderRequest) => orderService.createOrder(newOrder),
    onSuccess: () => {
      clearCart(); 
      alert('🚀 Đặt hàng thành công! Đơn hàng của bạn đang chờ hệ thống phê duyệt.');
      navigate('/order-history'); 
    },
    onError: (error: any) => {
      console.error(error);
      alert('❌ Đặt hàng thất bại. Vui lòng kiểm tra lại kết nối mạng!');
    }
  });

  const handleCheckout = () => {
    if (!address.trim()) return alert('⚠️ Vui lòng nhập địa chỉ giao hàng!');
    if (!phone.trim()) return alert('⚠️ Vui lòng nhập số điện thoại liên hệ!');

    const payload: CreateOrderRequest = {
      deliveryAddress: address,
      deliveryPhone: phone,
      voucherCode: appliedVoucher ? appliedVoucher.voucherCode : undefined,
      paymentMethod: 'COD', 
      notes: notes.trim() ? notes : undefined
    };

    createOrderMutation.mutate(payload);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 mb-4 animate-bounce">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h3 className="text-sm font-black text-slate-800">Giỏ hàng của bạn đang trống!</h3>
        <p className="text-[11px] text-slate-400 mt-1 max-w-xs">Hãy quay lại trang chủ chọn cho mình những món ăn ngon lấp đầy bụng đói nhé.</p>
        <button 
          onClick={() => navigate('/')}
          className="mt-6 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs px-6 py-2.5 rounded-xl transition-colors cursor-pointer"
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
            onClick={() => restaurantId ? navigate(`/customer/restaurant/${restaurantId}`) : navigate('/')} 
            className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-sm font-black text-slate-800">Xác nhận thanh toán</h2>
          <div className="w-9 h-9"></div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 mt-6 space-y-4">
        
        {/* TÊN NHÀ HÀNG ĐANG CHỌN ĐƠN */}
        <div className="bg-orange-500 text-white p-3 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="overflow-hidden">
            <span className="text-[10px] text-orange-100 font-bold block uppercase tracking-wider">Đơn hàng từ cửa hàng</span>
            <h3 className="text-xs font-black truncate">{restaurantName}</h3>
          </div>
          <ShoppingBag className="w-4 h-4 text-orange-200 shrink-0" />
        </div>

        {/* KHỐI DANH SÁCH MÓN ĂN TRONG GIỎ */}
        <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-xs space-y-3">
          <h4 className="text-xs font-black text-slate-800 border-b border-slate-50 pb-2">Danh sách món ăn chọn</h4>
          
          <div className="divide-y divide-slate-50 max-h-52 overflow-y-auto no-scrollbar">
            {cartItems.map((item) => (
              <div key={item.foodId} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 bg-slate-50 rounded-lg overflow-hidden shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="overflow-hidden">
                    <h5 className="text-xs font-bold text-slate-800 truncate">{item.name}</h5>
                    <span className="text-[10px] text-slate-400 font-medium">Số lượng: x{item.quantity}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-black text-slate-800">{(item.price * item.quantity).toLocaleString()}đ</span>
                  <button 
                    onClick={() => removeFromCart(item.foodId)}
                    className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* KHỐI THÔNG TIN ĐỊA CHỈ GIAO HÀNG */}
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
                placeholder="Ví dụ: Giao cổng sau, không bỏ hành, nhiều ớt..."
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
              className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-black text-xs px-4 py-2 rounded-xl transition-colors flex items-center gap-1"
            >
              {isCheckingVoucher && <Loader2 className="w-3 h-3 animate-spin" />}
              Áp dụng
            </button>
          </div>

          {/* Gợi ý voucher có sẵn từ API phân trang */}
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

        {/* KHỐI TỔNG HỢP CHI PHÍ TIỀN BẠC (SUMMARY BILL) */}
        <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-xs space-y-2.5 text-xs font-bold text-slate-500">
          <div className="flex justify-between items-center">
            <span>Tạm tính tiền món ăn:</span>
            <span className="text-slate-800 font-black">{subtotal.toLocaleString()}đ</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Phí vận chuyển giao hàng:</span>
            <span className="text-slate-800 font-black">+{deliveryFee.toLocaleString()}đ</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between items-center text-green-600">
              <span>Khuyến mãi giảm trừ (Voucher):</span>
              <span className="font-black">-{discount.toLocaleString()}đ</span>
            </div>
          )}
          <div className="h-px bg-slate-100 my-1"></div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-800 font-black">Tổng thanh toán đơn hàng:</span>
            <span className="text-orange-500 font-black text-base">{totalAmount.toLocaleString()}đ</span>
          </div>

          <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl flex items-center justify-between text-[11px] text-slate-500 mt-2">
            <span className="flex items-center gap-1 font-bold"><CreditCard className="w-3.5 h-3.5 text-slate-600" /> Phương thức thanh toán:</span>
            <span className="font-black text-slate-800 uppercase bg-white border px-2 py-0.5 rounded-md">Tiền mặt (COD)</span>
          </div>
        </div>

        {/* NÚT BẤM KÍCH HOẠT THANH TOÁN */}
        <button
          onClick={handleCheckout}
          disabled={createOrderMutation.isPending}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white font-black py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-orange-500/10 transition-all cursor-pointer text-xs"
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