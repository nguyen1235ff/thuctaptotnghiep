import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services/order';
import type { Order } from '../services/order';
import { 
  Calendar, ShoppingBag, ChevronRight, Clock, 
  CheckCircle2, Truck, AlertCircle, ArrowLeft, Loader2 
} from 'lucide-react';

export default function OrderHistory() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const size = 5; // Số lượng đơn hàng hiển thị trên mỗi trang

  // 1. Gọi React Query lấy dữ liệu lịch sử đơn hàng theo Page hiện tại
  const { data: paginationData, isLoading, isError } = useQuery({
    queryKey: ['orderHistory', page],
    queryFn: () => orderService.getHistory(page, size),
  });

  // 2. Bóc tách an toàn mảng đơn hàng thực tế từ Spring Boot PageResponse
  const ordersList: Order[] = paginationData?.content || [];
  const totalPages = paginationData?.totalPages || 1;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Hàm chuyển đổi format thời gian từ ISO String (Spring Boot) sang chuỗi trực quan
  const formatOrderDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Hàm helper render Badge trạng thái chuẩn xác theo enum Backend phát đi
  const renderStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'PENDING':
        return <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 border border-amber-100 px-2.5 py-1 rounded-lg font-bold text-[11px]"><Clock className="w-3.5 h-3.5" /> Chờ duyệt</span>;
      case 'CONFIRMED':
        return <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-600 border border-purple-100 px-2.5 py-1 rounded-lg font-bold text-[11px]"><CheckCircle2 className="w-3.5 h-3.5" /> Đã xác nhận</span>;
      case 'PREPARING':
        return <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-lg font-bold text-[11px]"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang chuẩn bị</span>;
      case 'READY_FOR_PICKUP':
        return <span className="inline-flex items-center gap-1 bg-cyan-50 text-cyan-600 border border-cyan-100 px-2.5 py-1 rounded-lg font-bold text-[11px]"><ShoppingBag className="w-3.5 h-3.5" /> Chờ tài xế lấy</span>;
      case 'DELIVERING':
        return <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 border border-orange-100 px-2.5 py-1 rounded-lg font-bold text-[11px]"><Truck className="w-3.5 h-3.5" /> Đang giao hàng</span>;
      case 'COMPLETED':
        return <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 border border-emerald-100 px-2.5 py-1 rounded-lg font-bold text-[11px]"><CheckCircle2 className="w-3.5 h-3.5" /> Thành công</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-600 border border-rose-100 px-2.5 py-1 rounded-lg font-bold text-[11px]"><AlertCircle className="w-3.5 h-3.5" /> Đã hủy đơn</span>;
      default:
        return <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-600 border border-slate-100 px-2.5 py-1 rounded-lg font-bold text-[11px]">{status}</span>;
    }
  };

  // Trạng thái Loading màn hình
  if (isLoading) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-2" />
        <p className="text-xs font-bold text-slate-500">Đang tải lịch sử mua hàng...</p>
      </div>
    );
  }

  // Trạng thái lỗi API
  if (isError) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
        <h3 className="font-bold text-slate-800 text-sm">Lỗi tải dữ liệu đơn hàng</h3>
        <p className="text-xs text-slate-400 mt-1 mb-4">Không thể kết nối với hệ thống. Vui lòng kiểm tra lại kết nối mạng.</p>
        <button onClick={() => navigate('/')} className="bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl">
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col pb-12">
      {/* HEADER TOP BAR */}
      <div className="sticky top-0 bg-white border-b border-slate-100 px-4 py-4 flex items-center gap-3 z-50 shadow-xs">
        <button 
          onClick={() => navigate('/')} 
          className="p-1.5 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer text-slate-700"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-sm font-black text-slate-900 tracking-tight">Lịch sử đơn hàng</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Danh sách món ăn bạn đã đặt</p>
        </div>
      </div>

      {/* DANH SÁCH ĐƠN HÀNG TRÊN VIEW */}
      <div className="p-4 flex-1">
        {ordersList.length > 0 ? (
          <div className="space-y-4">
            {ordersList.map((order) => (
              <div 
                key={order.orderId} 
                onClick={() => navigate(`/orders/${order.orderId}`)} // Điều hướng đến chi tiết đơn nếu có route
                className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden active:scale-[0.99] transition-transform cursor-pointer"
              >
                {/* Header đơn hàng: Tên Quán và Trạng thái */}
                <div className="p-4 flex items-start justify-between gap-2 border-b border-slate-50">
                  <div className="space-y-0.5">
                    <h3 className="font-black text-slate-800 text-sm line-clamp-1 flex items-center gap-1">
                      {order.restaurantName}
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                      <Calendar className="w-3 h-3" />
                      <span>{formatOrderDate(order.orderDate)}</span>
                    </div>
                  </div>
                  {renderStatusBadge(order.status)}
                </div>

                {/* Danh sách các món ăn trong đơn hàng này */}
                <div className="p-4 bg-white space-y-3">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.foodName} 
                          className="w-10 h-10 object-cover rounded-xl border border-slate-100 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <ShoppingBag className="w-4 h-4 text-slate-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-700 truncate">{item.foodName}</h4>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                          Số lượng: <span className="font-bold text-slate-600">{item.quantity}</span>
                        </p>
                      </div>
                      <span className="text-xs font-bold text-slate-600 flex-shrink-0">
                        {formatCurrency(item.price)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer đơn hàng: Tổng tiền thanh toán */}
                <div className="p-4 bg-slate-50/40 border-t border-slate-50 flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">
                    Thanh toán bằng: <strong className="text-slate-600 uppercase">{order.paymentMethod}</strong>
                  </span>
                  <div className="text-right">
                    <span className="text-slate-400 font-medium">Tổng thanh toán: </span>
                    <span className="text-sm font-black text-orange-500 ml-1">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* THANH PHÂN TRANG (PAGINATION PANEL) */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl bg-white text-xs font-bold text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Trước
                </button>
                <span className="text-xs font-bold text-slate-500">
                  Trang {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl bg-white text-xs font-bold text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Trạng thái trống nếu chưa từng đặt món */
          <div className="text-center py-16 bg-white border border-slate-100 rounded-2xl shadow-xs">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 text-sm">Bạn chưa có đơn hàng nào!</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">Hãy lượn một vòng trang chủ để tìm kiếm món ngon lấp đầy chiếc bụng đói nhé.</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer shadow-sm shadow-orange-500/10"
            >
              Khám phá món ngon ngay
            </button>
          </div>
        )}
      </div>
    </div>
  );
}