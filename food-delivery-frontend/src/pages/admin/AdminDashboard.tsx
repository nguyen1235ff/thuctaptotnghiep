import { useState } from 'react';
import { Users, Utensils, ShieldAlert } from 'lucide-react';
import ManageRestaurants from './ManageRestaurants';
import RestaurantDetailView from './RestaurantDetailView';

type MainTabType = 'USERS' | 'RESTAURANTS';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<MainTabType>('RESTAURANTS');
  
  // State quản lý việc lựa chọn vào sâu một nhà hàng cụ thể
  const [selectedRestaurant, setSelectedRestaurant] = useState<{ id: number; name: string } | null>(null);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-600 font-sans/anti">
      
      {/* 1. SIDEBAR CHÍNH */}
      <aside className="w-64 bg-slate-900 text-slate-400 p-5 flex flex-col gap-6 border-r border-slate-800">
        <div className="flex items-center gap-2.5 px-2 py-1">
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white text-base shadow-lg shadow-indigo-600/30">F</div>
          <div>
            <h1 className="text-sm font-black text-white tracking-wide">FOOD DELIVERY</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Hệ thống Quản trị</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          <button
            onClick={() => { setActiveTab('USERS'); setSelectedRestaurant(null); }}
            className={`flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
              activeTab === 'USERS' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" /> Quản lý Người dùng
          </button>

          <button
            onClick={() => { setActiveTab('RESTAURANTS'); }}
            className={`flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
              activeTab === 'RESTAURANTS' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <Utensils className="w-4 h-4" /> Quản lý Đối tác & Cửa hàng
          </button>
        </nav>
      </aside>

      {/* 2. KHU VỰC HIỂN THỊ NỘI DUNG BIẾN ĐỘNG */}
      <main className="flex-1 overflow-y-auto">
        
        {/* Render Tab Người dùng */}
        {activeTab === 'USERS' && (
          <div className="p-6">
            {/* Gọi Component <ManageUsers /> riêng của bạn ở đây */}
            <h2 className="text-xl font-black text-slate-800 mb-4">Phân hệ Quản lý Tài khoản người dùng</h2>
            <p className="text-sm text-slate-400">Giao diện danh sách User, Shipper và phân quyền tài khoản...</p>
          </div>
        )}

        {/* Render Tab Cửa hàng */}
        {activeTab === 'RESTAURANTS' && (
          selectedRestaurant ? (
            // Nếu đã click chọn một nhà hàng cụ thể -> Hiển thị sâu các phần Food, Voucher của nó
            <RestaurantDetailView 
              restaurantId={selectedRestaurant.id} 
              restaurantName={selectedRestaurant.name}
              onBack={() => setSelectedRestaurant(null)} 
            />
          ) : (
            // Nếu chưa chọn nhà hàng -> Hiển thị danh sách toàn bộ nhà hàng
            <ManageRestaurants 
              onSelectRestaurant={(id, name) => setSelectedRestaurant({ id, name })} 
            />
          )
        )}
      </main>
    </div>
  );
}