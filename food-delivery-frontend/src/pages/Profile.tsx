import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { User, Mail, Phone, Lock, KeyRound, LogOut, CheckCircle, Loader2 } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  
  // Mock thông tin user hiện tại lấy từ localStorage hoặc mặc định
  const [userInfo, setUserInfo] = useState({
    fullName: 'Nguyễn Ngọc Vinh',
    username: 'vinhndev',
    email: 'vinhnguyen@gmail.com',
    phone: '0987654321',
    role: 'Khách hàng thân thiết'
  });

  // State quản lý form đổi mật khẩu
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Nếu có username lưu từ lúc đăng nhập thì hiển thị, không thì dùng mock
    const savedUser = localStorage.getItem('username');
    if (savedUser) {
      setUserInfo(prev => ({ ...prev, username: savedUser }));
    }
  }, []);

  // Xử lý đổi mật khẩu
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (newPassword !== confirmPassword) {
      setErrorMessage('❌ Mật khẩu mới và xác nhận mật khẩu không khớp!');
      return;
    }

    setIsLoading(true);
    try {
      await authService.changePassword({ oldPassword, newPassword });
      setSuccessMessage('✅ Đổi mật khẩu thành công!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setErrorMessage(error.message || '❌ Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ.');
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý Đăng xuất
  const handleLogout = () => {
    localStorage.clear(); // Xóa sạch token, username
    alert('Đã đăng xuất tài khoản.');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header đơn giản */}
      <div className="bg-white border-b border-slate-100 py-4 px-6 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-lg font-bold text-slate-800">Tài khoản của tôi</h1>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Đăng xuất
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CỘT TRÁI: THÔNG TIN CÁ NHÂN */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs text-center">
            <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-3 font-black text-2xl uppercase">
              {userInfo.fullName.charAt(0)}
            </div>
            <h3 className="font-bold text-slate-800 text-base">{userInfo.fullName}</h3>
            <p className="text-xs bg-orange-50 text-orange-600 px-2.5 py-0.5 rounded-full inline-block font-semibold mt-1">
              {userInfo.role}
            </p>

            <div className="mt-6 text-left space-y-3.5 border-t border-slate-50 pt-5 text-xs font-medium text-slate-600">
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Tên đăng nhập</p>
                  <p className="text-slate-800">{userInfo.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Địa chỉ Email</p>
                  <p className="text-slate-800 truncate">{userInfo.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Số điện thoại</p>
                  <p className="text-slate-800">{userInfo.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: FORM ĐỔI MẬT KHẨU */}
        <div className="md:col-span-2">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
            <h3 className="font-bold text-slate-800 mb-4 text-sm flex items-center gap-1.5 border-b border-slate-50 pb-3">
              <KeyRound className="w-4 h-4 text-orange-500" /> Đổi mật khẩu bảo mật
            </h3>

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

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mật khẩu hiện tại
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Nhập mật khẩu đang dùng..."
                    className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-slate-700"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

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
                    className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-slate-700"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

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
                    placeholder="Nhập lại mật khẩu mới để kiểm tra..."
                    className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-slate-700"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer disabled:bg-slate-400"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Cập nhật mật khẩu'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}