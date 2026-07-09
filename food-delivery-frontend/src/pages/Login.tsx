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
      
      // Đồng bộ lưu thông tin xác thực sạch sẽ vào bộ nhớ trình duyệt
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken || '');
      localStorage.setItem('username', response.username);
      localStorage.setItem('roles', JSON.stringify(response.roles));
      
      // ✅ Đã chuẩn hóa: Quét mảng chuỗi roles thực tế của máy chủ để điều hướng phân quyền
      if (response.roles && response.roles.includes('ROLE_ADMIN')) {
        navigate('/admin');
      } else if (response.roles && (response.roles.includes('ROLE_OWNER') || response.roles.includes('ROLE_RESTAURANT'))) {
        navigate('/restaurant');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || '❌ Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản và mật khẩu!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      
      <button 
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại trang chủ
      </button>

      <div className="sm:mx-auto w-full sm:max-w-md">
        <div className="flex justify-center text-3xl">🚀</div>
        <h2 className="mt-4 text-center text-2xl font-black text-slate-800 tracking-tight">
          Chào mừng bạn quay trở lại!
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400 font-medium">
          Khám phá và đặt hàng nghìn món ăn ngon tại Ho Chi Minh City
        </p>
      </div>

      <div className="mt-8 sm:mx-auto w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 border border-slate-100 rounded-3xl shadow-xs sm:px-10">
          
          {errorMessage && (
            <div className="mb-5 bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold border border-red-100">
              {errorMessage}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Tài khoản đăng nhập
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập của bạn..."
                  className="w-full bg-slate-50 text-slate-800 pl-10 pr-4 py-3 rounded-xl text-xs font-bold border-2 border-transparent focus:border-orange-500 focus:bg-white focus:outline-none placeholder-slate-400 transition-all"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Mật khẩu bảo mật
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="w-full bg-slate-50 text-slate-800 pl-10 pr-10 py-3 rounded-xl text-xs font-bold border-2 border-transparent focus:border-orange-500 focus:bg-white focus:outline-none placeholder-slate-400 transition-all"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-slate-300 rounded-sm"
                />
                <label htmlFor="remember-me" className="ml-2 text-slate-500 font-medium select-none">
                  Ghi nhớ đăng nhập
                </label>
              </div>
              <a href="/forgot-password" className="font-bold text-orange-500 hover:text-orange-600">
                Quên mật khẩu?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer disabled:bg-orange-300"
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

          <div className="mt-6 text-center text-xs text-slate-400 font-medium">
            Chưaa có tài khoản?{' '}
            <Link to="/register" className="font-bold text-orange-500 hover:text-orange-600">
              Đăng ký ngay tại đây
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}