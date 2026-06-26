import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth';
import { Lock, User, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const response = await authService.login({ username, password });
      
      // Lưu token vào localStorage để duy trì trạng thái đăng nhập
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('username', response.username);
      
      // Đăng nhập thành công -> Đá người dùng về Trang chủ công việc
      navigate('/');
    } catch (error: any) {
      setErrorMessage(error.message || '❌ Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản, mật khẩu!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      
      {/* Nút quay lại trang chủ nhanh nằm góc trên */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-orange-500 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại trang chủ
      </button>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">
          Chào mừng bạn trở lại 👋
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Khám phá và đặt ngay những món ăn yêu thích của bạn
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 border border-slate-100 shadow-sm rounded-2xl sm:px-10">
          
          {/* Khối hiển thị thông báo lỗi nếu đăng nhập sai */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-medium text-red-600">
              {errorMessage}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            {/* Ô nhập Tên đăng nhập (Username) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Tên đăng nhập
              </label>
              <div className="relative rounded-xl shadow-xs">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập username của bạn..."
                  className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-slate-700 font-medium"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Ô nhập Mật khẩu (Password) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Mật khẩu
              </label>
              <div className="relative rounded-xl shadow-xs">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 pl-10 pr-10 py-3 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-slate-700 font-medium"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                
                {/* Nút bấm ẩn/hiện mật khẩu dạng icon mắt */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Khối Ghi nhớ thông tin & Quên mật khẩu */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-orange-500 border-slate-300 rounded-sm focus:ring-orange-400"
                />
                <label htmlFor="remember-me" className="ml-2 text-slate-500 font-medium select-none">
                  Ghi nhớ đăng nhập
                </label>
              </div>
              <a href="/forgot-password" className="font-bold text-orange-500 hover:text-orange-600">
                Quên mật khẩu?
              </a>
            </div>

            {/* Nút Đăng Nhập */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer disabled:bg-orange-300 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang xác thực...
                </>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>

          {/* Dẫn link sang trang Đăng ký tài khoản mới */}
          <div className="mt-6 text-center text-xs text-slate-400 font-medium">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-bold text-orange-500 hover:text-orange-600">
              Đăng ký ngay
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}