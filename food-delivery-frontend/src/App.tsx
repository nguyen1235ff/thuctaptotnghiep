import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import RestaurantDetailView from './pages/admin/RestaurantDetailView';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import AdminDashboard from './pages/admin/AdminDashboard';
import Profile from './pages/Profile';
import OrderHistory from './pages/OrderHistory';
import AdminUsers from './pages/admin/AdminUsers';
import { CartProvider } from './context/CartContext';
import CustomerRestaurantView from './pages/CustomerRestaurantView';
// --- IMPORT PHÂN HỆ RESTAURANT MỚI ---
import RestaurantDashboard from './pages/restaurant/RestaurantDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          {/* Tuyến đường công khai dành cho Khách hàng */}
          <Route path="/" element={<Home />} />
          <Route path="/restaurant/:id" element={<RestaurantDetailWrapper />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/order-history" element={<OrderHistory />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/customer/restaurant/:id" element={<CustomerRestaurantView />} />

        {/* Tuyến đường dành cho Admin */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* ============================================================== */}
        {/* TUYẾN ĐƯỜNG DÀNH CHO ROLE RESTAURANT (CHỦ CỬA HÀNG)           */}
        {/* ============================================================== */}
        <Route path="/restaurant/dashboard" element={<RestaurantDashboard />} />

        {/* Nếu gõ bậy đường dẫn, tự động đá về Trang Chủ */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}

function RestaurantDetailWrapper() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Chuyển đổi id từ string trên URL thành số (number)
  const restaurantId = Number(id) || 1; 

  // Bạn có thể giữ tên mặc định hoặc cập nhật logic lấy tên nhà hàng theo id sau này
  const restaurantName = "Quản lý nhà hàng"; 

  return (
    <RestaurantDetailView 
      restaurantId={restaurantId}
      restaurantName={restaurantName}
      onBack={() => navigate('/admin')} // Khi bấm nút Back sẽ quay về trang danh sách Admin
    />
  );
}