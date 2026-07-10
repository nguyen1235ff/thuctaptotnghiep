import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { restaurantService } from '../../services/restaurant';
import type { RestaurantResponse } from '../../services/restaurant';
import { 
  Store, Phone, MapPin, Mail, DollarSign, 
  ShoppingBag, FileText, Image as ImageIcon, Save 
} from 'lucide-react';

interface RestaurantOverviewTabProps {
  restaurant: RestaurantResponse;
}

export default function RestaurantOverviewTab({ restaurant }: RestaurantOverviewTabProps) {
  const queryClient = useQueryClient();

  // --- STATE QUẢN LÝ FORM CHỈNH SỬA ---
  const [restaurantName, setRestaurantName] = useState(restaurant.restaurantName);
  const [phone, setPhone] = useState(restaurant.phone);
  const [address, setAddress] = useState(restaurant.address);
  const [email, setEmail] = useState(restaurant.email || '');
  const [description, setDescription] = useState(restaurant.description || '');
  const [deliveryFee, setDeliveryFee] = useState(restaurant.deliveryFee);
  const [minOrderValue, setMinOrderValue] = useState(restaurant.minOrderValue);
  const [imageUrl, setImageUrl] = useState(restaurant.imageUrl || '');

  // Đồng bộ lại state nếu dữ liệu cache từ phía ngoài thay đổi (ví dụ khi toggle isActive)
  useEffect(() => {
    setRestaurantName(restaurant.restaurantName);
    setPhone(restaurant.phone);
    setAddress(restaurant.address);
    setEmail(restaurant.email || '');
    setDescription(restaurant.description || '');
    setDeliveryFee(restaurant.deliveryFee);
    setMinOrderValue(restaurant.minOrderValue);
    setImageUrl(restaurant.imageUrl || '');
  }, [restaurant]);

  // --- MUTATION CẬP NHẬT THÔNG TIN QUA API BE ---
  const updateInfoMutation = useMutation({
    mutationFn: (data: Partial<RestaurantResponse>) => 
      restaurantService.updateRestaurant(restaurant.restaurantId, data),
    onSuccess: () => {
      // Làm tươi lại cache để tất cả các page nhận thông tin mới
      queryClient.invalidateQueries({ queryKey: ['my-restaurant'] });
      alert('🎉 Cập nhật thông tin nhà hàng thành công!');
    },
    onError: (error) => {
      console.error(error);
      alert('❌ Có lỗi xảy ra khi lưu thông tin. Vui lòng kiểm tra lại!');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Gộp payload khớp chuẩn DTO CreateRestaurantRequest/RestaurantResponse ở BE
    updateInfoMutation.mutate({
      restaurantName,
      phone,
      address,
      email: email || undefined,
      description: description || undefined,
      deliveryFee,
      minOrderValue,
      imageUrl: imageUrl || undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
      
      {/* KHỐI 1: THÔNG TIN CƠ BẢN */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-2">
          <Store className="w-4 h-4 text-orange-500" /> Thông tin cơ bản gian hàng
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1.5 text-[11px] font-black text-slate-400 uppercase">Tên nhà hàng <span className="text-red-500">*</span></label>
            <div className="relative flex items-center">
              <Store className="w-4 h-4 absolute left-3 text-slate-400" />
              <input 
                type="text" required 
                value={restaurantName} onChange={e => setRestaurantName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/60 pl-10 pr-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-slate-300" 
              />
            </div>
          </div>

          <div>
            <label className="block mb-1.5 text-[11px] font-black text-slate-400 uppercase">Số điện thoại liên hệ <span className="text-red-500">*</span></label>
            <div className="relative flex items-center">
              <Phone className="w-4 h-4 absolute left-3 text-slate-400" />
              <input 
                type="text" required 
                value={phone} onChange={e => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/60 pl-10 pr-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-slate-300" 
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1.5 text-[11px] font-black text-slate-400 uppercase">Địa chỉ kinh doanh <span className="text-red-500">*</span></label>
            <div className="relative flex items-center">
              <MapPin className="w-4 h-4 absolute left-3 text-slate-400" />
              <input 
                type="text" required 
                value={address} onChange={e => setAddress(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/60 pl-10 pr-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-slate-300" 
              />
            </div>
          </div>

          <div>
            <label className="block mb-1.5 text-[11px] font-black text-slate-400 uppercase">Email nhận thông báo (Tùy chọn)</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 absolute left-3 text-slate-400" />
              <input 
                type="email" 
                value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/60 pl-10 pr-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-slate-300" 
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block mb-1.5 text-[11px] font-black text-slate-400 uppercase">Mô tả ngắn về quán</label>
          <div className="relative flex items-start">
            <FileText className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <textarea 
              rows={3}
              value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Nhập giới thiệu về phong cách ẩm thực của quán hoặc thông điệp gửi tới thực khách..."
              className="w-full bg-slate-50 border border-slate-200/60 pl-10 pr-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-slate-300 resize-none" 
            />
          </div>
        </div>
      </div>

      {/* KHỐI 2: CẤU HÌNH CHI PHÍ VÀ VẬN HÀNH */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-2">
          <ShoppingBag className="w-4 h-4 text-amber-500" /> Cấu hình chi phí vận hành
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1.5 text-[11px] font-black text-slate-400 uppercase">Phí giao hàng mặc định (đ) <span className="text-red-500">*</span></label>
            <div className="relative flex items-center">
              <DollarSign className="w-4 h-4 absolute left-3 text-slate-400" />
              <input 
                type="number" required min={0} step={1000}
                value={deliveryFee} onChange={e => setDeliveryFee(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200/60 pl-10 pr-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-slate-300" 
              />
            </div>
          </div>

          <div>
            <label className="block mb-1.5 text-[11px] font-black text-slate-400 uppercase">Đơn hàng tối thiểu để ship (đ) <span className="text-red-500">*</span></label>
            <div className="relative flex items-center">
              <ShoppingBag className="w-4 h-4 absolute left-3 text-slate-400" />
              <input 
                type="number" required min={0} step={1000}
                value={minOrderValue} onChange={e => setMinOrderValue(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200/60 pl-10 pr-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-slate-300" 
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block mb-1.5 text-[11px] font-black text-slate-400 uppercase">Đường dẫn hình ảnh Banner (URL)</label>
          <div className="relative flex items-center">
            <ImageIcon className="w-4 h-4 absolute left-3 text-slate-400" />
            <input 
              type="url" 
              value={imageUrl} onChange={e => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full bg-slate-50 border border-slate-200/60 pl-10 pr-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-slate-300" 
            />
          </div>
          {imageUrl && (
            <div className="mt-3 border border-slate-100 rounded-xl overflow-hidden h-24 max-w-xs bg-slate-50">
              <img src={imageUrl} alt="Preview Banner" className="w-full h-full object-cover" onError={(e)=>{(e.target as HTMLImageElement).src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400"}}/>
            </div>
          )}
        </div>
      </div>

      {/* THANH THAO TÁC LƯU DỮ LIỆU */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={updateInfoMutation.isPending}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white px-6 py-2.5 rounded-xl text-xs font-black shadow-sm transition-all"
        >
          {updateInfoMutation.isPending ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          ) : (
            <Save className="w-4 h-4" />
          )}
          {updateInfoMutation.isPending ? 'Đang lưu...' : 'Lưu cấu hình cửa hàng'}
        </button>
      </div>

    </form>
  );
}