import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService, type Order } from '../../services/order'; // Sử dụng chính xác orderService đồng bộ mới
import { 
  Clock, Check, Ban, Truck, CheckCircle, 
  AlertTriangle, ShoppingBag, DollarSign, Calendar, Loader2
} from 'lucide-react';

interface RestaurantOrdersTabProps {
  restaurantId: number;
}

// Định nghĩa lại các Tab bộ lọc dựa theo trường dữ liệu orderStatus của Backend
type OrderFilterStatus = 'ALL' | 'PENDING' | 'PREPARING' | 'READY_FOR_PICKUP' | 'DELIVERING' | 'COMPLETED' | 'CANCELLED';

export default function RestaurantOrdersTab({ restaurantId }: RestaurantOrdersTabProps) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<OrderFilterStatus>('ALL');

  // 1. CALL API: Lấy danh sách đơn hàng thực tế theo ID nhà hàng phân trang công khai từ Backend
  const { data: orderPage, isLoading, isError } = useQuery({
    queryKey: ['restaurant-orders', restaurantId],
    queryFn: () => orderService.getRestaurantOrders(restaurantId, 0, 50),
    enabled: !isNaN(restaurantId)
  });

  // 2. MUTATION: Cập nhật trạng thái hóa đơn (Sử dụng đúng biến orderStatus mới truyền lên)
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: Order['orderStatus'] }) => 
      orderService.updateOrderStatus(orderId, status),
    onSuccess: () => {
      // Làm mới danh sách đơn hàng ngay lập tức khi Backend xử lý thành công
      queryClient.invalidateQueries({ queryKey: ['restaurant-orders', restaurantId] });
    }
  });

  // Lọc cục bộ danh sách hiển thị đơn hàng dựa theo Tab đang chọn
  const filteredOrders = orderPage?.content?.filter(order => {
    if (filter === 'ALL') return true;
    return order.orderStatus === filter; // ✅ Đã sửa từ order.status -> order.orderStatus
  }) || [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Helper render thẻ trạng thái chuẩn hóa theo orderStatus
  const renderStatusBadge = (status: Order['orderStatus']) => {
    switch (status) {
      case 'PENDING':
        return <span className="bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full font-black text-[10px] uppercase tracking-wider">Chờ xác nhận</span>;
      case 'PREPARING':
        return <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-black text-[10px] uppercase tracking-wider">Đang chuẩn bị</span>;
      case 'READY_FOR_PICKUP':
        return <span className="bg-cyan-50 text-cyan-600 px-2.5 py-1 rounded-full font-black text-[10px] uppercase tracking-wider">Chờ tài xế lấy</span>;
      case 'DELIVERING':
        return <span className="bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-black text-[10px] uppercase tracking-wider">Đang giao hàng</span>;
      case 'COMPLETED':
        return <span className="bg-green-50 text-green-600 px-2.5 py-1 rounded-full font-black text-[10px] uppercase tracking-wider">Đã hoàn tất</span>;
      case 'CANCELLED':
        return <span className="bg-slate-100 text-slate-400 px-2.5 py-1 rounded-full font-black text-[10px] uppercase tracking-wider">Đã hủy đơn</span>;
      default:
        return <span className="bg-slate-50 text-slate-600 px-2.5 py-1 rounded-full font-black text-[10px] uppercase tracking-wider">{status}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-2 text-xs font-bold text-slate-400">
        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
        <span>Đang nạp danh sách hóa đơn từ máy chủ...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-3xl p-6 text-center text-xs font-bold text-red-600">
        ⚠️ Không thể tải danh sách đơn hàng. Vui lòng kiểm tra quyền truy cập của tài khoản chủ quán!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* THANH BỘ LỌC TRẠNG THÁI */}
      <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-2xl w-max border border-slate-200/40">
        {([
          { key: 'ALL', label: 'Tất cả' },
          { key: 'PENDING', label: '📥 Đơn mới' },
          { key: 'PREPARING', label: '🍳 Đang nấu' },
          { key: 'READY_FOR_PICKUP', label: '📦 Chờ giao' },
          { key: 'DELIVERING', label: '🚚 Shipper giữ' },
          { key: 'COMPLETED', label: '✅ Đã xong' },
          { key: 'CANCELLED', label: '❌ Đã hủy' }
        ] as { key: OrderFilterStatus; label: string }[]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
              filter === tab.key 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* DANH SÁCH ĐƠN HÀNG THỰC TẾ */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center space-y-2 shadow-xs">
          <ShoppingBag className="w-8 h-8 text-slate-200 mx-auto" />
          <h4 className="text-xs font-bold text-slate-700">Không có đơn hàng nào</h4>
          <p className="text-[10px] text-slate-400 max-w-xs mx-auto">Hiện tại không có hóa đơn nào thuộc trạng thái này trong hệ thống nhà hàng.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredOrders.map((order: Order) => (
            <div key={order.orderId} className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row justify-between p-5 gap-4">
              
              {/* Cột trái: Chi tiết đơn hàng */}
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-black text-slate-800 text-sm">Mã đơn: #{order.orderCode || order.orderId}</span>
                  {renderStatusBadge(order.orderStatus)} {/* ✅ Đã sửa sang trường orderStatus */}
                </div>
                
                <div className="flex flex-col gap-1 text-[11px] text-slate-400 font-bold">
                  <div className="flex items-center gap-4">
                    {/* ✅ Đã sửa từ orderDate -> createdAt để lấy chuẩn mốc thời gian từ DB */}
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(order.createdAt).toLocaleString('vi-VN')}</span>
                    <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Thanh toán: {order.paymentMethod}</span>
                  </div>
                  <p className="text-slate-500 mt-1"><strong className="text-slate-600">📍 Địa chỉ giao:</strong> {order.deliveryAddress} ({order.deliveryPhone})</p>
                  {order.notes && <p className="text-amber-600 italic"><strong className="text-slate-600">✍️ Ghi chú đơn:</strong> {order.notes}</p>}
                </div>

                {/* Danh sách món ăn có trong đơn */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5 max-w-md">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs font-bold text-slate-600">
                      <span>• {item.foodName} <b className="text-orange-600">x{item.quantity}</b></span>
                      {/* ✅ Đã sửa từ item.price -> item.unitPrice phù hợp cấu trúc thực tế */}
                      <span className="text-slate-400">{formatCurrency((item.totalPrice) || (item.unitPrice * item.quantity))}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cột phải: Tính tiền & Nút thay đổi trạng thái vòng đời đơn */}
              <div className="flex flex-col justify-between items-end shrink-0 min-w-[180px] gap-4">
                <div className="text-right">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Tổng số thu hộ (COD)</span>
                  <span className="text-base font-black text-orange-500">{formatCurrency(order.totalAmount)}</span>
                </div>

                <div className="flex items-center gap-1.5 w-full md:w-auto">
                  {/* Trạng thái PENDING: Chờ nhận đơn */}
                  {order.orderStatus === 'PENDING' && (
                    <>
                      <button 
                        onClick={() => updateStatusMutation.mutate({ orderId: order.orderId, status: 'PREPARING' })}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 text-xs font-black rounded-xl shadow-sm transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> Nhận đơn
                      </button>
                      <button 
                        onClick={() => { if(confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) updateStatusMutation.mutate({ orderId: order.orderId, status: 'CANCELLED' }) }}
                        className="p-2 text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors cursor-pointer"
                        title="Hủy đơn hàng"
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {/* Trạng thái PREPARING: Đang chuẩn bị nấu */}
                  {order.orderStatus === 'PREPARING' && (
                    <button 
                      onClick={() => updateStatusMutation.mutate({ orderId: order.orderId, status: 'READY_FOR_PICKUP' })}
                      className="w-full flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 text-xs font-black rounded-xl shadow-sm transition-colors cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5" /> Nấu xong, chờ Shipper
                    </button>
                  )}

                  {/* Trạng thái READY_FOR_PICKUP: Chờ giao hàng */}
                  {order.orderStatus === 'READY_FOR_PICKUP' && (
                    <div className="text-cyan-600 bg-cyan-50 border border-cyan-100 px-3 py-1.5 rounded-xl font-black flex items-center gap-1.5 text-[11px] uppercase tracking-wide">
                      <Clock className="w-3.5 h-3.5 animate-pulse" /> Đang đợi tài xế lấy hàng
                    </div>
                  )}

                  {/* Trạng thái DELIVERING: Đang trên đường đi giao */}
                  {order.orderStatus === 'DELIVERING' && (
                    <div className="text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl font-black flex items-center gap-1.5 text-[11px] uppercase tracking-wide">
                      <Truck className="w-3.5 h-3.5" /> Shipper đang đi giao
                    </div>
                  )}

                  {/* Trạng thái COMPLETED: Đơn thành công */}
                  {order.orderStatus === 'COMPLETED' && (
                    <div className="text-green-600 bg-green-50 border border-green-100 px-3 py-1.5 rounded-xl font-black flex items-center gap-1.5 text-[11px] uppercase tracking-wide">
                      <CheckCircle className="w-3.5 h-3.5" /> Giao thành công
                    </div>
                  )}

                  {/* Trạng thái CANCELLED: Đơn bị hủy bỏ */}
                  {order.orderStatus === 'CANCELLED' && (
                    <div className="text-slate-400 bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-xl font-black flex items-center gap-1.5 text-[11px] uppercase tracking-wide">
                      <AlertTriangle className="w-3.5 h-3.5" /> Đơn hàng bị hủy
                    </div>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}