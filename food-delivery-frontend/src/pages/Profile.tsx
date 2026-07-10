import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/user'; // Import chuẩn dịch vụ user thay vì gọi trực tiếp api
import { 
  User, Mail, Phone, Lock, KeyRound, LogOut, 
  Loader2, Edit2 
} from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State quản lý Form chỉnh sửa thông tin cá nhân
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // State quản lý Form đổi mật khẩu
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // State quản lý thông báo chung
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 1. REACT QUERY: LẤY THÔNG TIN CÁ NHÂN TỪ API THỰC TẾ (Không dùng Mock Data)
  const { data: userInfo, isLoading, isError } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => userService.getProfile(), // Gọi hàm sạch từ service kết nối BE
  });

  // Đồng bộ dữ liệu từ API vào Form chỉnh sửa khi load thành công
  useEffect(() => {
    if (userInfo) {
      setFullName(userInfo.fullName || '');
      setPhone(userInfo.phone || '');
    }
  }, [userInfo]);

  // 2. MUTATION: CẬP NHẬT THÔNG TIN CÁ NHÂN (API PUT /users/profile)
  const updateProfileMutation = useMutation({
    mutationFn: (updatedData: { fullName: string; phone: string }) => 
      userService.updateProfile(updatedData),
    onSuccess: (data) => {
      queryClient.setQueryData(['userProfile'], data);
      setProfileMessage({ type: 'success', text: '🎉 Cập nhật thông tin cá nhân thành công!' });
      setIsEditingProfile(false);
    },
    onError: (error: any) => {
      setProfileMessage({ 
        type: 'error', 
        text: error?.response?.data?.message || '❌ Cập nhật thông tin thất bại. Vui lòng thử lại!' 
      });
    }
  });

  // Xử lý submit lưu Profile
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);
    if (!fullName.trim() || !phone.trim()) {
      setProfileMessage({ type: 'error', text: 'Vui lòng điền đầy đủ Họ tên và Số điện thoại' });
      return;
    }
    updateProfileMutation.mutate({ fullName, phone });
  };

  // 3. XỬ LÝ ĐỔI MẬT KHẨU (API PUT /users/change-password)
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: '❌ Xác nhận mật khẩu mới không khớp!' });
      return;
    }

    setIsLoadingPassword(true);
    try {
      // Gọi đúng hàm put đồng bộ từ userService
      await userService.changePassword({ oldPassword, newPassword });
      setPasswordMessage({ type: 'success', text: '🎉 Đổi mật khẩu thành công!' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setPasswordMessage({ 
        type: 'error', 
        text: error?.response?.data?.message || '❌ Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ!' 
      });
    } finally {
      setIsLoadingPassword(false);
    }
  };

  // Xử lý Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    localStorage.removeItem('roles');
    navigate('/login');
  };

  // Trạng thái Loading ban đầu khi chờ dữ liệu thực tế từ BE
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-9 h-9 text-orange-500 animate-spin" />
        <p className="text-sm font-bold text-slate-400">Đang tải hồ sơ cá nhân...</p>
      </div>
    );
  }

  // Trạng thái Lỗi (ví dụ token hết hạn hoặc Server sập)
  if (isError || !userInfo) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 gap-4">
        <p className="text-sm font-bold text-red-500 text-center">
          Phiên đăng nhập đã hết hạn hoặc không thể kết nối đến máy chủ!
        </p>
        <button onClick={handleLogout} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold">
          Đăng nhập lại
        </button>
      </div>
    );
  }

  // Đọc danh sách vai trò từ localStorage đã lưu khi Login để hiển thị nhãn UI phù hợp
  const storedRoles: string[] = JSON.parse(localStorage.getItem('roles') || '[]');

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* TIÊU ĐỀ TRANG CÁ NHÂN */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-xs gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center text-white text-2xl font-black shadow-md shadow-orange-500/20">
              {userInfo.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight">{userInfo.fullName}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2.5 py-0.5 rounded-md">
                  @{userInfo.username}
                </span>
                <span className="text-xs bg-orange-50 text-orange-600 font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider text-[10px]">
                  {storedRoles.includes('ROLE_ADMIN') ? 'Quản trị viên' : storedRoles.includes('ROLE_OWNER') ? 'Chủ nhà hàng' : 'Khách hàng'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer border border-red-100 w-full sm:w-auto justify-center"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất tài khoản
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* KHỐI 1: THÔNG TIN TÀI KHOẢN & FORM CẬP NHẬT */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-orange-500" /> Thông tin tài khoản
              </h2>
              {!isEditingProfile && (
                <button 
                  onClick={() => setIsEditingProfile(true)}
                  className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Chỉnh sửa
                </button>
              )}
            </div>

            {profileMessage && (
              <div className={`p-3 rounded-xl text-xs font-bold border ${
                profileMessage.type === 'success' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
              }`}>
                {profileMessage.text}
              </div>
            )}

            {!isEditingProfile ? (
              <div className="space-y-4">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Họ và tên</span>
                  <p className="text-sm font-bold text-slate-700 bg-slate-50 px-4 py-2.5 rounded-xl border border-transparent">{userInfo.fullName}</p>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Địa chỉ Email</span>
                  <p className="text-sm font-bold text-slate-700 bg-slate-50 px-4 py-2.5 rounded-xl border border-transparent flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" /> {userInfo.email}
                  </p>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Số điện thoại</span>
                  <p className="text-sm font-bold text-slate-700 bg-slate-50 px-4 py-2.5 rounded-xl border border-transparent flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" /> {userInfo.phone || 'Chưa cập nhật'}
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Họ và tên mới</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-slate-700 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Số điện thoại mới</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-slate-700 font-bold"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer disabled:bg-slate-300"
                  >
                    {updateProfileMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Lưu thay đổi
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingProfile(false);
                      setProfileMessage(null);
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* KHỐI 2: ĐỔI MẬT KHẨU BẢO MẬT */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-orange-500" /> Đổi mật khẩu bảo mật
            </h2>

            {passwordMessage && (
              <div className={`p-3 rounded-xl text-xs font-bold border ${
                passwordMessage.type === 'success' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
              }`}>
                {passwordMessage.text}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Mật khẩu hiện tại
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Nhập mật khẩu cũ của bạn..."
                    className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-slate-700"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Mật khẩu bảo mật mới
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự bảo mật..."
                    className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-slate-700"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
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
                  disabled={isLoadingPassword}
                  className="w-full sm:w-auto bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer disabled:bg-slate-400"
                >
                  {isLoadingPassword ? (
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