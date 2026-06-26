import { useQuery } from '@tanstack/react-query';
import { restaurantService } from '../../services/restaurant';
import { Utensils, Eye, ToggleLeft, ToggleRight } from 'lucide-react';

interface ManageRestaurantsProps {
  onSelectRestaurant: (id: number, name: string) => void;
}

export default function ManageRestaurants({ onSelectRestaurant }: ManageRestaurantsProps) {
  const { data: restaurantPage, isLoading } = useQuery({
    queryKey: ['adminRestaurants'],
    queryFn: () => restaurantService.getAllRestaurants(0, 50)
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <Utensils className="w-5 h-5 text-indigo-600" /> Quản lý Nhà hàng Hệ thống
        </h2>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase border-b border-slate-100">
            <tr>
              <th className="py-3 px-4">Hình ảnh</th>
              <th className="py-3 px-4">Tên Nhà Hàng</th>
              <th className="py-3 px-4">Địa chỉ & SĐT</th>
              <th className="py-3 px-4">Phí giao hàng</th>
              <th className="py-3 px-4 text-center">Trạng thái</th>
              <th className="py-3 px-4 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-10">Đang tải danh sách nhà hàng...</td></tr>
            ) : restaurantPage?.content?.map((res) => (
              <tr key={res.restaurantId} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-4">
                  <img src={res.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200"} className="w-12 h-12 object-cover rounded-xl border border-slate-100" alt="" />
                </td>
                <td className="py-3 px-4">
                  <div className="font-bold text-slate-800 text-sm">{res.restaurantName}</div>
                  <div className="text-[11px] text-slate-400">Đánh giá: ⭐ {res.rating} ({res.totalReviews} review)</div>
                </td>
                <td className="py-3 px-4 text-slate-500">
                  <div>{res.address}</div>
                  <div className="font-mono text-[11px]">{res.phone}</div>
                </td>
                <td className="py-3 px-4 font-bold text-slate-700">{res.deliveryFee.toLocaleString()}đ</td>
                <td className="py-3 px-4 text-center">
                  {res.isActive ? (
                    <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 px-2 py-1 rounded-md"><ToggleRight className="w-4 h-4" /> Hoạt động</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-400 px-2 py-1 rounded-md"><ToggleLeft className="w-4 h-4" /> Tạm dừng</span>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => onSelectRestaurant(res.restaurantId, res.restaurantName)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-colors font-bold"
                  >
                    <Eye className="w-3.5 h-3.5" /> Vào quản lý dữ liệu
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}