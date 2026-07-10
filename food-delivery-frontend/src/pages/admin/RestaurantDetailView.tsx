import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { foodService, type CreateFoodRequest } from '../../services/food'; // Tách biệt import thực thi và type theo verbatimModuleSyntax
import type { Food } from '../../services/food';
import { categoryService } from '../../services/category';
import type { Category } from '../../services/category';
import { voucherService } from '../../services/voucher';
import type { VoucherResponse } from '../../services/voucher';
import { orderService } from '../../services/order'; // ✨ SỬA: Chuyển hoàn toàn từ adminService sang orderService chuẩn của nhà hàng
import type { Order } from '../../services/order';

import { 
  ArrowLeft, Plus, Edit2, Trash2, X, Check, Ban, Clock, Truck, 
  CheckCircle, AlertTriangle, ToggleLeft, ToggleRight, Loader2 
} from 'lucide-react';

interface RestaurantDetailViewProps {
  restaurantId: number;
  restaurantName: string;
  onBack: () => void;
}

type SubTabType = 'FOODS' | 'CATEGORIES' | 'VOUCHERS' | 'ORDERS';

export default function RestaurantDetailView({ restaurantId, restaurantName, onBack }: RestaurantDetailViewProps) {
  const queryClient = useQueryClient();
  const [subTab, setSubTab] = useState<SubTabType>('FOODS');

  // ==========================================
  // 1. CÁC API QUERIES (LẤY DỮ LIỆU ĐỒNG BỘ THỰC TẾ)
  // ==========================================
  
  // Tab Món ăn theo Nhà hàng
  const { data: foodsData, isLoading: loadingFoods } = useQuery({
    queryKey: ['foods', restaurantId],
    queryFn: () => foodService.getByRestaurantId(restaurantId)
  });

  // Tab Danh mục theo Nhà hàng 
  const { data: categories = [], isLoading: loadingCategories } = useQuery<Category[]>({
    queryKey: ['categories', restaurantId],
    queryFn: () => categoryService.getByRestaurantId(restaurantId)
  });

  // Tab Voucher hệ thống/nhà hàng có sẵn công khai
  const { data: voucherPage, isLoading: loadingVouchers } = useQuery({
    queryKey: ['vouchers', restaurantId],
    queryFn: () => voucherService.getAllAvailable(0, 50)
  });

  // Tab Đơn hàng của nhà hàng (Sửa chuẩn: Gọi API dành riêng cho Restaurant Owner từ orderService)
  const { data: orderPage, isLoading: loadingOrders } = useQuery({
    queryKey: ['restaurant-orders', restaurantId],
    queryFn: () => orderService.getRestaurantOrders(restaurantId, 0, 50),
    enabled: subTab === 'ORDERS'
  });

  // ==========================================
  // 2. CÁC MUTATIONS (XỬ LÝ DỮ LIỆU TƯƠNG TÁC)
  // ==========================================
  const deleteFoodMutation = useMutation({
    mutationFn: (foodId: number) => foodService.delete(foodId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['foods', restaurantId] })
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (catId: number) => categoryService.delete(catId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories', restaurantId] })
  });

  // Cập nhật trạng thái đơn hàng (Đồng bộ chuẩn luồng Params sang orderService)
  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: Order['orderStatus'] }) => 
      orderService.updateOrderStatus(orderId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['restaurant-orders', restaurantId] })
  });

  // ==========================================
  // 3. STATES QUẢN LÝ TÌNH TRẠNG MODALS FORM
  // ==========================================
  const [activeModal, setActiveModal] = useState<'FOOD' | 'CATEGORY' | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  // States tạm thời cho Form nhập liệu (Đồng bộ chính xác tên thuộc tính CreateFoodRequest từ Backend)
  const [foodForm, setFoodForm] = useState<CreateFoodRequest>({ 
    foodName: '', 
    price: 0, 
    description: '', 
    imageUrl: '', 
    categoryId: 0 
  });
  const [categoryFormName, setCategoryFormName] = useState('');

  // Xử lý submit biểu mẫu Thêm/Sửa món ăn thực tế
  const saveFoodMutation = useMutation({
    mutationFn: (data: CreateFoodRequest) => editingItem 
      ? foodService.update(editingItem.foodId, data)
      : foodService.create(restaurantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foods', restaurantId] });
      closeAllModals();
    }
  });

  // Xử lý submit biểu mẫu Thêm/Sửa danh mục phân loại thực tế
  const saveCategoryMutation = useMutation({
    mutationFn: (name: string) => editingItem
      ? categoryService.update(editingItem.categoryId, name)
      : categoryService.create(restaurantId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', restaurantId] });
      closeAllModals();
    }
  });

  const closeAllModals = () => {
    setActiveModal(null);
    setEditingItem(null);
    setFoodForm({ foodName: '', price: 0, description: '', imageUrl: '', categoryId: 0 });
    setCategoryFormName('');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="p-6">
      {/* Header Điều hướng thông tin quán ăn */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase">{restaurantName}</h2>
          <p className="text-xs text-slate-400 font-medium">Bảng quản trị dữ liệu phân hệ chi tiết (ID quán: #{restaurantId})</p>
        </div>
      </div>

      {/* THANH MENU TABS ĐIỀU HƯỚNG NỘI BỘ */}
      <div className="flex gap-2 border-b border-slate-200 mb-6 pb-px">
        {(['FOODS', 'CATEGORIES', 'VOUCHERS', 'ORDERS'] as SubTabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              subTab === tab ? 'border-slate-900 text-slate-900 font-black' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab === 'FOODS' && '🍔 Món ăn'}
            {tab === 'CATEGORIES' && '🗂️ Danh mục'}
            {tab === 'VOUCHERS' && '🎟️ Voucher'}
            {tab === 'ORDERS' && '📦 Đơn hàng'}
          </button>
        ))}
      </div>

      {/* ==========================================
          TAB 1: QUẢN LÝ MÓN ĂN (FOODS)
          ========================================== */}
      {subTab === 'FOODS' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Danh sách thực đơn quán</span>
            <button 
              onClick={() => setActiveModal('FOOD')}
              className="flex items-center gap-1.5 bg-slate-900 text-white px-3.5 py-2 text-xs font-black rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm món mới
            </button>
          </div>
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Ảnh</th>
                <th className="py-3 px-4">Tên món</th>
                <th className="py-3 px-4">Danh mục</th>
                <th className="py-3 px-4">Giá tiền</th>
                <th className="py-3 px-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {loadingFoods ? (
                <tr><td colSpan={5} className="text-center py-10"><Loader2 className="w-5 h-5 animate-spin mx-auto text-orange-500" /></td></tr>
              ) : foodsData?.content?.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400">Chưa có món ăn nào trong thực đơn</td></tr>
              ) : foodsData?.content?.map((food: Food) => (
                <tr key={food.foodId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <img src={food.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100"} className="w-12 h-12 object-cover rounded-xl border border-slate-100" alt="" />
                  </td>
                  {/* ✅ Đã đồng bộ sang .foodName từ Backend DTO */}
                  <td className="py-3 px-4 font-bold text-slate-800">{food.foodName}</td>
                  <td className="py-3 px-4 text-slate-500">
                    {categories.find(c => c.categoryId === food.categoryId)?.categoryName || `Mã nhóm #${food.categoryId}`}
                  </td>
                  <td className="py-3 px-4 font-black text-orange-500">{formatCurrency(food.price)}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => { 
                          setEditingItem(food); 
                          setFoodForm({ foodName: food.foodName, price: food.price, description: food.description, imageUrl: food.imageUrl, categoryId: food.categoryId || 0 }); 
                          setActiveModal('FOOD'); 
                        }} 
                        className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => { if(confirm('Bạn có chắc chắn muốn xóa món này?')) deleteFoodMutation.mutate(food.foodId) }} 
                        className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ==========================================
          TAB 2: QUẢN LÝ DANH MỤC (CATEGORIES)
          ========================================== */}
      {subTab === 'CATEGORIES' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Danh mục món ăn của nhà hàng</span>
            <button 
              onClick={() => setActiveModal('CATEGORY')}
              className="flex items-center gap-1.5 bg-slate-900 text-white px-3.5 py-2 text-xs font-black rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm danh mục mới
            </button>
          </div>
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Mã nhóm</th>
                <th className="py-3 px-4">Tên danh mục phân loại</th>
                <th className="py-3 px-4 text-center">Thao tác xử lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {loadingCategories ? (
                <tr><td colSpan={3} className="text-center py-10"><Loader2 className="w-5 h-5 animate-spin mx-auto text-orange-500" /></td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan={3} className="text-center py-10 text-slate-400">Chưa thiết lập danh mục phân loại nào</td></tr>
              ) : categories.map((cat: Category) => (
                <tr key={cat.categoryId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 text-slate-400 font-mono">#{cat.categoryId}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{cat.categoryName}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => { setEditingItem(cat); setCategoryFormName(cat.categoryName); setActiveModal('CATEGORY'); }}
                        className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => { if(confirm('Xóa nhóm danh mục này có thể ảnh hưởng đến hiển thị món ăn?')) deleteCategoryMutation.mutate(cat.categoryId) }}
                        className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ==========================================
          TAB 3: QUẢN LÝ VOUCHER KHUYẾN MÃI (VOUCHERS)
          ========================================== */}
      {subTab === 'VOUCHERS' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50/50 border-b border-slate-100">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Chương trình mã giảm giá đang áp dụng</span>
          </div>
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Mã Code</th>
                <th className="py-3 px-4">Chi tiết giảm giá</th>
                <th className="py-3 px-4">Điều kiện tối thiểu</th>
                <th className="py-3 px-4">Lượt dùng (Đã/Tối đa)</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {loadingVouchers ? (
                <tr><td colSpan={5} className="text-center py-10"><Loader2 className="w-5 h-5 animate-spin mx-auto text-orange-500" /></td></tr>
              ) : voucherPage?.content?.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400">Chưa có mã giảm giá áp dụng công khai</td></tr>
              ) : voucherPage?.content?.map((v: VoucherResponse) => (
                <tr key={v.voucherId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-black text-indigo-600 bg-indigo-50/60 rounded-lg px-2.5 py-1 inline-block my-2">{v.voucherCode}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-800">{v.description || 'Giảm giá ưu đãi'}</div>
                    <div className="text-[11px] text-slate-400 font-bold">Mức giảm: {formatCurrency(v.discountValue)}{v.discountType === 'PERCENTAGE' ? '%' : 'đ'}</div>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-600">{formatCurrency(v.minOrderValue)}</td>
                  <td className="py-3 px-4 text-slate-500 font-mono">{v.usedCount} / {v.maxUses || '∞'}</td>
                  <td className="py-3 px-4 text-center">
                    {v.isActive ? (
                      <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 px-2 py-0.5 rounded-md font-bold text-[10px]"><ToggleRight className="w-3.5 h-3.5" /> HOẠT ĐỘNG</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-400 px-2 py-0.5 rounded-md font-bold text-[10px]"><ToggleLeft className="w-3.5 h-3.5" /> KHÓA</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ==========================================
          TAB 4: QUẢN LÝ ĐƠN HÀNG (ORDERS)
          ========================================== */}
      {subTab === 'ORDERS' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50/50 border-b border-slate-100">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Danh sách quản lý đơn hàng nhận được</span>
          </div>
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Mã Đơn</th>
                <th className="py-3 px-4">Thời gian</th>
                <th className="py-3 px-4">Chi tiết món gọi</th>
                <th className="py-3 px-4">Tổng tiền thanh toán</th>
                <th className="py-3 px-4 text-center">Trạng thái xử lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {loadingOrders ? (
                <tr><td colSpan={5} className="text-center py-10"><Loader2 className="w-5 h-5 animate-spin mx-auto text-orange-500" /></td></tr>
              ) : orderPage?.content?.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400">Cửa hàng chưa ghi nhận đơn hàng nào</td></tr>
              ) : orderPage?.content?.map((order: Order) => (
                <tr key={order.orderId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-black text-slate-800">#{order.orderCode || order.orderId}</td>
                  {/* ✅ Sửa từ orderDate -> createdAt khớp thực thể thực tế */}
                  <td className="py-3 px-4 text-slate-400 font-medium">{new Date(order.createdAt).toLocaleString('vi-VN')}</td>
                  <td className="py-3 px-4">
                    <div className="max-w-xs space-y-0.5">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="text-slate-600 flex justify-between font-bold">
                          <span>• {item.foodName} <b className="text-orange-500">x{item.quantity}</b></span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-black text-slate-800">{formatCurrency(order.totalAmount)}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* ✅ Đồng bộ chuẩn luồng orderStatus mới của Backend */}
                      {order.orderStatus === 'PENDING' && (
                        <>
                          <button onClick={() => updateOrderStatusMutation.mutate({ orderId: order.orderId, status: 'PREPARING' })} className="flex items-center gap-1 bg-green-50 text-green-600 px-2 py-1 rounded-lg hover:bg-green-100 font-bold text-[11px] cursor-pointer"><Check className="w-3 h-3" /> Nhận đơn</button>
                          <button onClick={() => { if(confirm('Hủy bỏ đơn hàng này?')) updateOrderStatusMutation.mutate({ orderId: order.orderId, status: 'CANCELLED' }) }} className="flex items-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded-lg hover:bg-red-100 font-bold text-[11px] cursor-pointer"><Ban className="w-3 h-3" /> Hủy</button>
                        </>
                      )}
                      {order.orderStatus === 'PREPARING' && (
                        <button onClick={() => updateOrderStatusMutation.mutate({ orderId: order.orderId, status: 'READY_FOR_PICKUP' })} className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-100 font-bold text-[11px] cursor-pointer"><Clock className="w-3 h-3" /> Nấu xong, chờ shipper</button>
                      )}
                      {order.orderStatus === 'READY_FOR_PICKUP' && (
                        <span className="text-cyan-600 bg-cyan-50 px-2 py-1 rounded-md font-bold flex items-center gap-1 text-[11px]"><Clock className="w-3.5 h-3.5" /> Chờ giao</span>
                      )}
                      {order.orderStatus === 'DELIVERING' && (
                        <span className="text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md font-bold flex items-center gap-1 text-[11px]"><Truck className="w-3.5 h-3.5" /> Đang đi giao</span>
                      )}
                      {order.orderStatus === 'COMPLETED' && (
                        <span className="text-green-600 bg-green-50 px-2 py-1 rounded-md font-bold flex items-center gap-1 text-[11px]"><CheckCircle className="w-3.5 h-3.5" /> Hoàn tất</span>
                      )}
                      {order.orderStatus === 'CANCELLED' && (
                        <span className="text-slate-400 bg-slate-100 px-2 py-1 rounded-md font-bold flex items-center gap-1 text-[11px]"><AlertTriangle className="w-3.5 h-3.5" /> Đã hủy</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ==========================================
          BIỂU MẪU MODAL POPUP (FOOD & CATEGORY FORM)
          ========================================== */}
      {activeModal === 'FOOD' && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">{editingItem ? '✏️ Cập nhật món ăn' : '✨ Thêm món ăn mới'}</h3>
              <button onClick={closeAllModals} className="text-slate-400 hover:text-slate-600 p-1 bg-white border border-slate-200 rounded-lg cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); saveFoodMutation.mutate(foodForm); }} className="p-5 space-y-4 text-xs font-bold text-slate-500">
              <div>
                <label className="block mb-1">Tên món ăn</label>
                {/* ✅ Gắn đúng thuộc tính .foodName */}
                <input type="text" required value={foodForm.foodName} onChange={e => setFoodForm({...foodForm, foodName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none text-slate-800" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Giá bán (đ)</label>
                  <input type="number" required value={foodForm.price || ''} onChange={e => setFoodForm({...foodForm, price: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none text-slate-800" />
                </div>
                <div>
                  <label className="block mb-1">Phân loại danh mục</label>
                  <select value={foodForm.categoryId} onChange={e => setFoodForm({...foodForm, categoryId: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none text-slate-800 font-bold">
                    <option value={0}>-- Chọn nhóm --</option>
                    {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block mb-1">Đường dẫn hình ảnh URL</label>
                {/* ✅ Gắn đúng thuộc tính .imageUrl */}
                <input type="text" value={foodForm.imageUrl} onChange={e => setFoodForm({...foodForm, imageUrl: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none font-mono text-[11px]" placeholder="https://images.unsplash.com/..." />
              </div>
              <div>
                <label className="block mb-1">Mô tả tóm tắt món ăn</label>
                <textarea rows={3} value={foodForm.description} onChange={e => setFoodForm({...foodForm, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none resize-none text-slate-800 font-medium" />
              </div>
              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button type="button" onClick={closeAllModals} className="px-4 py-2 text-slate-400 cursor-pointer">Hủy</button>
                <button type="submit" disabled={saveFoodMutation.isPending} className="bg-slate-900 text-white font-black px-5 py-2 rounded-xl cursor-pointer shadow-xs">
                  {saveFoodMutation.isPending ? 'Đang lưu...' : 'Lưu lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'CATEGORY' && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">{editingItem ? '✏️ Sửa danh mục' : '🗂️ Tạo danh mục mới'}</h3>
              <button onClick={closeAllModals} className="text-slate-400 hover:text-slate-600 p-1 bg-white border border-slate-200 rounded-lg cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); saveCategoryMutation.mutate(categoryFormName); }} className="p-5 space-y-4 text-xs font-bold text-slate-500">
              <div>
                <label className="block mb-1.5">Tên nhóm danh mục</label>
                <input type="text" required value={categoryFormName} onChange={e => setCategoryFormName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none text-slate-800" placeholder="Ví dụ: Món lẩu, Đồ uống..." />
              </div>
              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button type="button" onClick={closeAllModals} className="px-4 py-2 text-slate-400 cursor-pointer">Hủy</button>
                <button type="submit" disabled={saveCategoryMutation.isPending} className="bg-slate-900 text-white font-black px-5 py-2 rounded-xl cursor-pointer shadow-xs">
                  {saveCategoryMutation.isPending ? 'Đang xử lý...' : 'Xác nhận'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}