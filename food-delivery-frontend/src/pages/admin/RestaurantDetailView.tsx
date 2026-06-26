import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// Tuân thủ verbatimModuleSyntax: Tách biệt import thực thi và import type
import { foodService } from '../../services/food';
import type { Food } from '../../services/food';
import { categoryService } from '../../services/category';
import type { Category } from '../../services/category';
import { voucherService } from '../../services/voucher';
import type { VoucherResponse } from '../../services/voucher';
import { adminService } from '../../services/admin';
import type { Order } from '../../services/order';

import { 
  ArrowLeft, Plus, Edit2, Trash2, X, Check, Ban, Clock, Truck, 
  CheckCircle, AlertTriangle, ChevronRight, ToggleLeft, ToggleRight 
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
  // 1. CÁC API QUERIES (LẤY DỮ LIỆU)
  // ==========================================
  
  // Tab Món ăn theo Nhà hàng
  const { data: foodsData, isLoading: loadingFoods } = useQuery({
    queryKey: ['foods', restaurantId],
    queryFn: () => foodService.getByRestaurantId(restaurantId)
  });

  // Tab Danh mục theo Nhà hàng (Sửa lại đúng hàm getByRestaurantId)
  const { data: categories = [], isLoading: loadingCategories } = useQuery<Category[]>({
    queryKey: ['categories', restaurantId],
    queryFn: () => categoryService.getByRestaurantId(restaurantId)
  });

  // Tab Voucher hệ thống/nhà hàng (Để an toàn tránh lỗi gán mảng, ta không dùng default value)
  const { data: voucherPage, isLoading: loadingVouchers } = useQuery({
    queryKey: ['adminVouchers'],
    queryFn: () => voucherService.getAllAdmin(0, 50)
  });

  // Tab Đơn hàng của nhà hàng (Sử dụng service lấy đơn hàng toàn cục hoặc mock từ adminService)
  const { data: orderPage, isLoading: loadingOrders } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: () => adminService.getAllOrders(0, 50)
  });

  // ==========================================
  // 2. CÁC MUTATIONS (XỬ LÝ XÓA)
  // ==========================================
  const deleteFoodMutation = useMutation({
    mutationFn: (foodId: number) => foodService.delete(foodId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['foods', restaurantId] })
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (catId: number) => categoryService.delete(catId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories', restaurantId] })
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: Order['status'] }) => 
      adminService.updateOrderStatus(orderId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminOrders'] })
  });

  // ==========================================
  // 3. STATES QUẢN LÝ TÌNH TRẠNG MODALS FORM
  // ==========================================
  const [activeModal, setActiveModal] = useState<'FOOD' | 'CATEGORY' | 'VOUCHER' | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  // States tạm thời cho Form nhập liệu
  const [foodForm, setFoodForm] = useState({ name: '', price: 0, description: '', image: '', categoryId: 0 });
  const [categoryFormName, setCategoryFormName] = useState('');

  // Hàm xử lý hành động submit biểu mẫu món ăn
  const saveFoodMutation = useMutation({
    mutationFn: (data: any) => editingItem 
      ? foodService.update(editingItem.foodId, data)
      : foodService.create(restaurantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foods', restaurantId] });
      closeAllModals();
    }
  });

  // Hàm xử lý hành động submit biểu mẫu danh mục
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
    setFoodForm({ name: '', price: 0, description: '', image: '', categoryId: 0 });
    setCategoryFormName('');
  };

  return (
    <div className="p-6">
      {/* Header Điều hướng thông tin quán ăn */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>
        <div>
          <h2 className="text-xl font-black text-slate-800">{restaurantName}</h2>
          <p className="text-xs text-slate-400 font-medium">Bảng quản trị dữ liệu phân hệ chi tiết (ID quán: #{restaurantId})</p>
        </div>
      </div>

      {/* THANH MENU TABS ĐIỀU HƯỚNG NỘI BỘ */}
      <div className="flex gap-2 border-b border-slate-200 mb-6 pb-px">
        {(['FOODS', 'CATEGORIES', 'VOUCHERS', 'ORDERS'] as SubTabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
              subTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
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
          TAB 1: QUẢN LÝ MÓN ĂN
          ========================================== */}
      {subTab === 'FOODS' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Danh sách thực đơn quán</span>
            <button 
              onClick={() => setActiveModal('FOOD')}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 text-xs font-black rounded-xl shadow-sm transition-all"
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
                <tr><td colSpan={5} className="text-center py-10">Đang tải danh sách món ăn...</td></tr>
              ) : foodsData?.content?.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400">Chưa có món ăn nào trong thực đơn</td></tr>
              ) : foodsData?.content?.map((food: Food) => (
                <tr key={food.foodId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4"><img src={food.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100"} className="w-12 h-12 object-cover rounded-xl border border-slate-100" alt="" /></td>
                  <td className="py-3 px-4 font-bold text-slate-800">{food.name}</td>
                  <td className="py-3 px-4 text-slate-500">
                    {categories.find(c => c.categoryId === food.categoryId)?.categoryName || `Mã nhóm #${food.categoryId}`}
                  </td>
                  <td className="py-3 px-4 font-black text-orange-600">{food.price.toLocaleString()}đ</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => { setEditingItem(food); setFoodForm({ name: food.name, price: food.price, description: food.description, image: food.image, categoryId: food.categoryId || 0 }); setActiveModal('FOOD'); }} 
                        className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => { if(confirm('Bạn có chắc chắn muốn xóa món này?')) deleteFoodMutation.mutate(food.foodId) }} 
                        className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
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
          TAB 2: QUẢN LÝ DANH MỤC
          ========================================== */}
      {subTab === 'CATEGORIES' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Danh mục món ăn của nhà hàng</span>
            <button 
              onClick={() => setActiveModal('CATEGORY')}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 text-xs font-black rounded-xl shadow-sm transition-all"
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
                <tr><td colSpan={3} className="text-center py-10">Đang tải nhóm danh mục...</td></tr>
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
                        className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => { if(confirm('Xóa nhóm danh mục này có thể ảnh hưởng đến hiển thị món ăn?')) deleteCategoryMutation.mutate(cat.categoryId) }}
                        className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
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
          TAB 3: QUẢN LÝ VOUCHER KHUYẾN MÃI
          ========================================== */}
      {subTab === 'VOUCHERS' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
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
                <tr><td colSpan={5} className="text-center py-10">Đang tải dữ liệu chương trình giảm giá...</td></tr>
              ) : voucherPage?.content?.map((v: VoucherResponse) => (
                <tr key={v.voucherId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600 bg-indigo-50/30 rounded px-2 py-1 inline-block my-2 mx-4">{v.voucherCode}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-800">{v.description || 'Giảm giá ưu đãi'}</div>
                    <div className="text-[11px] text-slate-400">Mức giảm: {v.discountValue.toLocaleString()}{v.discountType === 'PERCENTAGE' ? '%' : 'đ'}</div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-600">{v.minOrderValue.toLocaleString()}đ</td>
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
                <tr><td colSpan={5} className="text-center py-10">Đang tải đơn hàng...</td></tr>
              ) : orderPage?.content?.map((order: Order) => (
                <tr key={order.orderId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">{order.orderId}</td>
                  <td className="py-3 px-4 text-slate-400">{order.orderDate}</td>
                  <td className="py-3 px-4">
                    <div className="max-w-xs space-y-0.5">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="text-slate-600 flex justify-between">
                          <span>• {item.foodName} <b className="text-indigo-600">x{item.quantity}</b></span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-black text-slate-800">{order.totalAmount.toLocaleString()}đ</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {order.status === 'PENDING' && (
                        <>
                          <button onClick={() => updateOrderStatusMutation.mutate({ orderId: order.orderId, status: 'PREPARING' })} className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-100 font-bold text-[11px]"><Check className="w-3 to h-3" /> Nhận đơn</button>
                          <button onClick={() => updateOrderStatusMutation.mutate({ orderId: order.orderId, status: 'CANCELLED' })} className="flex items-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded-lg hover:bg-red-100 font-bold text-[11px]"><Ban className="w-3 h-3" /> Hủy</button>
                        </>
                      )}
                      {order.status === 'PREPARING' && (
                        <button onClick={() => updateOrderStatusMutation.mutate({ orderId: order.orderId, status: 'DELIVERING' })} className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded-lg hover:bg-amber-100 font-bold text-[11px]"><Clock className="w-3 h-3" /> Chuẩn bị xong, giao hàng</button>
                      )}
                      {order.status === 'DELIVERING' && (
                        <span className="text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md font-bold flex items-center gap-1 text-[11px]"><Truck className="w-3.5 h-3.5" /> Đang đi giao</span>
                      )}
                      {order.status === 'COMPLETED' && (
                        <span className="text-green-600 bg-green-50 px-2 py-1 rounded-md font-bold flex items-center gap-1 text-[11px]"><CheckCircle className="w-3.5 h-3.5" /> Hoàn tất</span>
                      )}
                      {order.status === 'CANCELLED' && (
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
          BIỂU MẪU MODAL POPUP (FOOD & CATEGORY)
          ========================================== */}
      {activeModal === 'FOOD' && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">{editingItem ? '✏️ Cập nhật món ăn' : '✨ Thêm món ăn mới'}</h3>
              <button onClick={closeAllModals} className="text-slate-400 hover:text-slate-600 p-1 bg-white border border-slate-200 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); saveFoodMutation.mutate(foodForm); }} className="p-5 space-y-4 text-xs font-bold text-slate-500">
              <div>
                <label className="block mb-1">Tên món ăn</label>
                <input type="text" required value={foodForm.name} onChange={e => setFoodForm({...foodForm, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none text-slate-800" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Giá bán (đ)</label>
                  <input type="number" required value={foodForm.price || ''} onChange={e => setFoodForm({...foodForm, price: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none text-slate-800" />
                </div>
                <div>
                  <label className="block mb-1">Phân loại danh mục</label>
                  <select value={foodForm.categoryId} onChange={e => setFoodForm({...foodForm, categoryId: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none text-slate-800">
                    <option value={0}>-- Chọn nhóm --</option>
                    {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block mb-1">Đường dẫn hình ảnh URL</label>
                <input type="text" value={foodForm.image} onChange={e => setFoodForm({...foodForm, image: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none font-mono text-[11px]" placeholder="https://images.unsplash.com/..." />
              </div>
              <div>
                <label className="block mb-1">Mô tả tóm tắt món ăn</label>
                <textarea rows={3} value={foodForm.description} onChange={e => setFoodForm({...foodForm, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none resize-none text-slate-800" />
              </div>
              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button type="button" onClick={closeAllModals} className="px-4 py-2 text-slate-400">Hủy</button>
                <button type="submit" disabled={saveFoodMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl">
                  {saveFoodMutation.isPending ? 'Đang lưu...' : 'Lưu lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'CATEGORY' && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">{editingItem ? '✏️ Sửa danh mục' : '🗂️ Tạo danh mục mới'}</h3>
              <button onClick={closeAllModals} className="text-slate-400 hover:text-slate-600 p-1 bg-white border border-slate-200 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); saveCategoryMutation.mutate(categoryFormName); }} className="p-5 space-y-4 text-xs font-bold text-slate-500">
              <div>
                <label className="block mb-1.5">Tên nhóm danh mục</label>
                <input type="text" required value={categoryFormName} onChange={e => setCategoryFormName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none text-slate-800" placeholder="Ví dụ: Món lẩu, Đồ uống..." />
              </div>
              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button type="button" onClick={closeAllModals} className="px-4 py-2 text-slate-400">Hủy</button>
                <button type="submit" disabled={saveCategoryMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl">
                  {saveCategoryMutation.isPending ? 'Đang tạo...' : 'Xác nhận'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}