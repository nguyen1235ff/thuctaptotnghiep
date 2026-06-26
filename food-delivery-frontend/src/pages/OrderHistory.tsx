import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services/order';
import type { Order } from '../services/order';
import { Calendar, ShoppingBag, ChevronRight, Clock, CheckCircle2, Truck, AlertCircle, ArrowLeft } from 'lucide-react';

export default function OrderHistory() {
  const navigate = useNavigate();

  // Dùng React Query gọi dữ liệu lịch sử đơn hàng
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orderHistory'],
    queryFn: orderService.getHistory
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Hàm helper render Badge trạng thái động
  const renderStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'PENDING':
        return <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 border border-amber-100 px-2.5 py-1 rounded-lg font-bold"><Clock className="w-3.5 h-3.5" /> Chờ duyệt</span>;
      case 'PREPARING':
        return <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-lg font-bold"><Clock className="w-3.5 h-3.5" /> Đang chuẩn bị</span>;
      case 'DELIVERING':
        return <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 border border-indigo-100 px-2.5 py-1 rounded-lg font-bold animate-pulse"><Truck className="w-3.5 h-3.5" /> Tài xế đang giao</span>;
      case 'COMPLETED':
        return <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 border border-emerald-100 px-2.5 py-1 rounded-lg font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> Đã giao đến</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 border border-red-100 px-2.5 py-1 rounded-lg font-bold"><AlertCircle className="w-3.5 h-3.5" /> Đã hủy đơn</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Header Điều hướng nhanh */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-xs">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <button 
            onClick={() => navigate('/')} 
            className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-slate-800">Lịch sử đơn hàng của bạn</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="bg-white border border-slate-100 rounded-2xl p-5 animate-pulse space-y-3">
                <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                <div className="h-12 bg-slate-50 rounded"></div>
                <div className="h-4 bg-slate-100 rounded w-1/4 ml-auto"></div>
              </div>
            ))}
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div 
                key={order.orderId} 
                className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden transition-all hover:border-slate-200"
              >
                {/* Khối Header của thẻ Đơn hàng */}
                <div className="p-4 bg-slate-50/60 border-b border-slate-100 flex flex-wrap justify-between items-center gap-2 text-xs">
                  <div className="space-y-1">
                    <p className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-orange-500" /> {order.restaurantName}
                    </p>
                    <p className="text-slate-400 flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5" /> {order.orderDate} | Mã đơn: <span className="font-bold text-slate-600">{order.orderId}</span>
                    </p>
                  </div>
                  <div>{renderStatusBadge(order.status)}</div>
                </div>

                {/* Khối danh sách món ăn thu gọn bên trong */}
                <div className="p-4 divide-y divide-slate-50">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.image} 
                          alt={item.foodName} 
                          className="w-10 h-10 object-cover rounded-lg border border-slate-100 shrink-0 bg-slate-100" 
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-700">{item.foodName}</p>
                          <p className="text-[11px] text-slate-400 font-medium">Số lượng: {item.quantity} x {formatCurrency(item.price)}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-600">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* Khối chân trang chứa tổng thanh toán */}
                <div className="p-4 bg-slate-50/20 border-t border-slate-50 flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Thanh toán bằng: <strong className="text-slate-600">{order.paymentMethod}</strong></span>
                  <p className="text-slate-500 font-medium">
                    Tổng thanh toán:{' '}
                    <span className="text-base font-black text-orange-500 ml-1">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Trạng thái trống nếu chưa từng đặt món */
          <div className="text-center py-16 bg-white border border-slate-100 rounded-2xl shadow-xs">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 text-sm">Bạn chưa có đơn hàng nào!</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">Hãy lượn một vòng trang chủ để tìm kiếm món ngon lấp đầy chiếc bụng đói nhé.</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              Đặt món ngay bấy giờ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}