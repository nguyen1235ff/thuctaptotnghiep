import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth';
import { Lock, User, Mail, Phone, Info, Loader2, ArrowLeft, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  
  // Các state quản lý các trường nhập liệu (Đã đồng bộ)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [roleName, setRoleName] = useState('CUSTOMER'); // ✨ BỔ SUNG: Mặc định ban đầu là Khách hàng
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      // ✅ Đã sửa: Truyền đầy đủ trường roleName chuẩn hóa theo yêu cầu cấu trúc của RegisterRequest.java
      await authService.register({ username, password, email, fullName, phone, roleName });
      
      alert('🎉 Đăng ký tài khoản đối tác thành công! Hệ thống sẽ chuyển bạn sang trang Đăng nhập.');
      navigate('/login'); 
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || '❌ Đăng ký thất bại. Vui lòng kiểm tra lại thông tin tài khoản!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8 relative">
      
      {/* Nút quay lại trang chủ nhanh */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-orange-500 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại trang chủ
      </button>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">
          Tạo tài khoản mới ✨
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Tham gia cùng tụi mình để trải nghiệm dịch vụ giao đồ ăn siêu tốc
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 border border-slate-100 shadow-sm rounded-2xl sm:px-10">
          
          {/* Thông báo lỗi nếu xảy ra trục trặc */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-medium text-red-600">
              {errorMessage}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleRegister}>
            
            {/* Vai trò tài khoản */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Bạn tham gia với vai trò?
              </label>
              <div className="relative rounded-xl shadow-xs">
                <select
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-slate-700 font-black cursor-pointer"
                >
                  <option value="CUSTOMER">🛒 Khách hàng mua đồ ăn</option>
                  <option value="RESTAURANT">🍳 Chủ nhà hàng đối tác gian hàng</option>
                </select>
                <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* 1. Họ và tên */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Họ và tên
              </label>
              <div className="relative rounded-xl shadow-xs">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Ngọc Vinh"
                  className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-slate-700 font-medium"
                />
                <Info className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* 2. Tên đăng nhập */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tên đăng nhập (Username)
              </label>
              <div className="relative rounded-xl shadow-xs">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên tài khoản..."
                  className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-slate-700 font-medium"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* 3. Địa chỉ Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Địa chỉ Email
              </label>
              <div className="relative rounded-xl shadow-xs">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-slate-700 font-medium"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* 4. Số điện thoại */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Số điện thoại
              </label>
              <div className="relative rounded-xl shadow-xs">
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Nhập 10 số điện thoại..."
                  className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-slate-700 font-medium"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* 5. Mật khẩu */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mật khẩu
              </label>
              <div className="relative rounded-xl shadow-xs">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự..."
                  className="w-full bg-slate-50 border border-slate-200 pl-10 pr-10 py-2.5 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-slate-700 font-medium"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Điều khoản dịch vụ kèm checkbox */}
            <div className="flex items-start text-xs pt-1">
              <input
                id="terms"
                type="checkbox"
                required
                className="mt-0.5 h-4 w-4 text-orange-500 border-slate-300 rounded-sm focus:ring-orange-400 cursor-pointer"
              />
              <label htmlFor="terms" className="ml-2 text-slate-500 font-medium select-none">
                Tôi đồng ý với các <span className="text-orange-500 font-bold">Điều khoản sử dụng</span> và <span className="text-orange-500 font-bold">Chính sách bảo mật</span>.
              </label>
            </div>

            {/* Nút bấm Đăng Ký */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer mt-2 disabled:bg-orange-300 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang xử lý tạo tài khoản...
                </>
              ) : (
                'Đăng ký tài khoản'
              )}
            </button>
          </form>

          {/* Dẫn liên kết quay lại Đăng nhập */}
          <div className="mt-6 text-center text-xs text-slate-400 font-medium">
            Đã có tài khoản rồi?{' '}
            <Link to="/login" className="font-bold text-orange-500 hover:text-orange-600">
              Đăng nhập ngay
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}