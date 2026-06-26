import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin';
import type { Order } from '../../services/order';
import { 
  Clock, Check, Ban, Truck, CheckCircle, 
  AlertTriangle, ShoppingBag, DollarSign, Calendar
} from 'lucide-react';

interface RestaurantOrdersTabProps {
  restaurantId: number;
}

type OrderFilterStatus = 'ALL' | 'PENDING' | 'PREPARING' | 'DELIVERING' | 'COMPLETED' | 'CANCELLED';

export default function RestaurantOrdersTab({ restaurantId }: RestaurantOrdersTabProps) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<OrderFilterStatus>('ALL');

  // 1. LẤY DANH SÁCH ĐƠN HÀNG TOÀN CỤC (Sắp tới BE sẽ bổ sung api lọc theo restaurantId)
  const { data: orderPage, isLoading } = useQuery({
    queryKey: ['restaurant-orders', restaurantId],
    queryFn: () => adminService.getAllOrders(0, 50)
  });

  // 2. MUTATION CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG (Khớp BE Spring Boot)
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: Order['status'] }) => 
      adminService.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-orders', restaurantId] });
    }
  });

  // Lọc danh sách đơn hàng theo Tab được chọn
  const filteredOrders = orderPage?.content?.filter(order => {
    if (filter === 'ALL') return true;
    return order.status === filter;
  }) || [];

  // Hàm helper render badge trạng thái màu sắc mượt mà
  const renderStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'PENDING':
        return <span className="bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full font-black text-[10px] uppercase tracking-wider">Chờ nhận đơn</span>;
      case 'PREPARING':
        return <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-black text-[10px] uppercase tracking-wider">Đang chuẩn bị</span>;
      case 'DELIVERING':
        return <span className="bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-black text-[10px] uppercase tracking-wider">Đang giao hàng</span>;
      case 'COMPLETED':
        return <span className="bg-green-50 text-green-600 px-2.5 py-1 rounded-full font-black text-[10px] uppercase tracking-wider">Đã hoàn tất</span>;
      case 'CANCELLED':
        return <span className="bg-slate-100 text-slate-400 px-2.5 py-1 rounded-full font-black text-[10px] uppercase tracking-wider">Đã hủy đơn</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* THANH ĐIỀU HƯỚNG BỘ LỌC TRẠNG THÁI ĐƠN HÀNG */}
      <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-2xl w-max border border-slate-200/40">
        {([
          { key: 'ALL', label: 'Tất cả' },
          { key: 'PENDING', label: '📥 Đơn mới' },
          { key: 'PREPARING', label: '🍳 Đang nấu' },
          { key: 'DELIVERING', label: '🚚 Đang giao' },
          { key: 'COMPLETED', label: '✅ Đã xong' },
          { key: 'CANCELLED', label: '❌ Đã hủy' }
        ] as { key: OrderFilterStatus; label: string }[]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all ${
              filter === tab.key 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* DANH SÁCH ĐƠN HÀNG */}
      {isLoading ? (
        <div className="py-20 text-center text-xs font-medium text-slate-400 animate-pulse">Đang nạp danh sách hóa đơn...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center space-y-2">
          <ShoppingBag className="w-8 h-8 text-slate-200 mx-auto" />
          <h4 className="text-xs font-bold text-slate-700">Không có đơn hàng nào</h4>
          <p className="text-[10px] text-slate-400 max-w-xs mx-auto">Hiện tại không có hóa đơn nào thuộc trạng thái lọc này.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredOrders.map((order: Order) => (
            <div key={order.orderId} className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row justify-between p-5 gap-4">
              
              {/* Cột trái: Thông tin chính của đơn */}
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-black text-slate-800 text-sm">{order.orderId}</span>
                  {renderStatusBadge(order.status)}
                </div>
                
                <div className="flex items-center gap-4 text-[11px] text-slate-400 font-bold">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {order.orderDate}</span>
                  <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Thanh toán: {order.paymentMethod}</span>
                </div>

                {/* Danh sách các món ăn thực khách đặt */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5 max-w-md">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs font-bold text-slate-600">
                      <span>• {item.foodName} <b className="text-orange-600">x{item.quantity}</b></span>
                      <span className="text-slate-400">{(item.price * item.quantity).toLocaleString()}đ</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cột phải: Tính tiền & Nút hành động tương tác vận hành */}
              <div className="flex flex-col justify-between items-end shrink-0 min-w-[180px] gap-4">
                <div className="text-right">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Tổng tiền thu hộ</span>
                  <span className="text-base font-black text-slate-900">{order.totalAmount.toLocaleString()}đ</span>
                </div>

                {/* Khối xử lý thay đổi trạng thái vòng đời đơn hàng */}
                <div className="flex items-center gap-1.5 w-full md:w-auto">
                  {order.status === 'PENDING' && (
                    <>
                      <button 
                        onClick={() => updateStatusMutation.mutate({ orderId: order.orderId, status: 'PREPARING' })}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 text-xs font-black rounded-xl shadow-sm transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" /> Nhận đơn
                      </button>
                      <button 
                        onClick={() => { if(confirm('Bạn có chắc chắn muốn từ chối/hủy đơn hàng này?')) updateStatusMutation.mutate({ orderId: order.orderId, status: 'CANCELLED' }) }}
                        className="p-2 text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                        title="Từ chối đơn"
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {order.status === 'PREPARING' && (
                    <button 
                      onClick={() => updateStatusMutation.mutate({ orderId: order.orderId, status: 'DELIVERING' })}
                      className="w-full flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 text-xs font-black rounded-xl shadow-sm transition-colors"
                    >
                      <Clock className="w-3.5 h-3.5" /> Nấu xong, gọi Ship
                    </button>
                  )}

                  {order.status === 'DELIVERING' && (
                    <div className="text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl font-black flex items-center gap-1.5 text-[11px] uppercase tracking-wide">
                      <Truck className="w-3.5 h-3.5" /> Shipper đang giao
                    </div>
                  )}

                  {order.status === 'COMPLETED' && (
                    <div className="text-green-600 bg-green-50 border border-green-100 px-3 py-1.5 rounded-xl font-black flex items-center gap-1.5 text-[11px] uppercase tracking-wide">
                      <CheckCircle className="w-3.5 h-3.5" /> Đã giao thành công
                    </div>
                  )}

                  {order.status === 'CANCELLED' && (
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