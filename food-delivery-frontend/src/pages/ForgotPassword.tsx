import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { Mail, Lock, KeyRound, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  
  // Quản lý các bước: 'EMAIL' (Bước 1) hoặc 'RESET' (Bước 2)
  const [step, setStep] = useState<'EMAIL' | 'RESET'>('EMAIL');
  
  // State form dữ liệu
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Xử lý Bước 1: Gửi yêu cầu lấy token qua Email
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      await authService.forgotPassword({ email });
      setSuccessMessage('🎉 Hệ thống đã gửi mã Token khôi phục về Email của bạn!');
      setStep('RESET'); // Chuyển sang bước nhập Token & Mật khẩu mới
    } catch (error: any) {
      setErrorMessage(error.message || '❌ Gửi yêu cầu thất bại. Vui lòng kiểm tra lại Email!');
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý Bước 2: Nhập Token từ Email và đổi mật khẩu mới
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (newPassword !== confirmPassword) {
      setErrorMessage('❌ Xác nhận mật khẩu mới không trùng khớp!');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword({ token, newPassword, confirmPassword });
      alert('🎉 Đặt lại mật khẩu thành công! Bạn sẽ được chuyển hướng về trang Đăng nhập.');
      navigate('/login');
    } catch (error: any) {
      setErrorMessage(error.message || '❌ Token không hợp lệ hoặc đã hết hạn.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      
      <button 
        onClick={() => navigate('/login')}
        className="absolute top-6 left-6 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-orange-500 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại đăng nhập
      </button>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">
          {step === 'EMAIL' ? 'Quên mật khẩu? 🔑' : 'Đặt lại mật khẩu ✨'}
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          {step === 'EMAIL' 
            ? 'Nhập email tài khoản để nhận mã Token khôi phục mật khẩu.' 
            : 'Điền mã Token từ Email và thiết lập mật khẩu mới của bạn.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 border border-slate-100 shadow-sm rounded-2xl sm:px-10">
          
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-medium text-red-600">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-medium text-emerald-700">
              {successMessage}
            </div>
          )}

          {/* BƯỚC 1: FORM NHẬP EMAIL */}
          {step === 'EMAIL' ? (
            <form className="space-y-5" onSubmit={handleSendEmail}>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Địa chỉ Email tài khoản
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-slate-700 font-medium"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer disabled:bg-orange-300"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Gửi mã xác nhận Token'
                )}
              </button>
            </form>
          ) : (

            // BƯỚC 2: FORM NHẬP TOKEN VÀ RESET PASSWORD
            <form className="space-y-4" onSubmit={handleResetPassword}>
              {/* Ô nhập Token */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mã Token xác nhận (từ Email)
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <input
                    type="text"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Nhập mã token..."
                    className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-slate-700 font-medium"
                  />
                  <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Mật khẩu mới */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mật khẩu mới
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự..."
                    className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-slate-700 font-medium"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Xác nhận mật khẩu */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Xác nhận lại mật khẩu mới
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới..."
                    className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-slate-700 font-medium"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer disabled:bg-orange-300 mt-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Xác nhận đổi mật khẩu'
                )}
              </button>
              
              <button
                type="button"
                onClick={() => setStep('EMAIL')}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-600 font-medium pt-2 cursor-pointer"
              >
                 Quay lại nhập lại Email
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}