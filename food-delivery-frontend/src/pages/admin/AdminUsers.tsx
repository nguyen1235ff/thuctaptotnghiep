import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../services/user';
import { Shield, UserCheck, UserX, Search, Users } from 'lucide-react';

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 15;

  // Lấy dữ liệu phân trang JPA từ AdminController.java
  const { data: userPage, isLoading } = useQuery({
    queryKey: ['adminUsers', currentPage],
    queryFn: () => userService.getAllUsersAdmin(currentPage, pageSize)
  });

  // Thay đổi trạng thái tài khoản kích hoạt / vô hiệu hóa
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => userService.toggleUserActive(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers', currentPage] });
    }
  });

  const handleToggleStatus = (userId: number, currentStatus: boolean) => {
    const action = currentStatus ? 'VÔ HIỆU HÓA' : 'KÍCH HOẠT';
    if (confirm(`Bạn có chắc chắn muốn ${action} người dùng mã #${userId}?`)) {
      toggleActiveMutation.mutate({ id: userId, active: !currentStatus });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* SIDEBAR TỔNG ADMIN */}
      <div className="w-64 bg-slate-900 text-white p-5 space-y-6 shrink-0">
        <h1 className="text-xl font-black text-orange-500 flex items-center gap-2"><Shield className="w-5 h-5 text-orange-500" /> ROOT CONTROLLER</h1>
        <nav className="space-y-1">
          <div className="flex items-center gap-3 px-4 py-3 bg-orange-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer">
            <Users className="w-4 h-4" /> Quản lý tài khoản Users
          </div>
        </nav>
      </div>

      {/* CORE BOARD */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-slate-200 py-4 px-6 flex justify-between items-center">
          <h2 className="text-base font-black text-slate-800 uppercase tracking-wide">Danh sách thành viên hệ thống</h2>
        </header>

        <main className="p-6 flex-1 flex flex-col space-y-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex-1 flex flex-col">
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase border-b border-slate-100">
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Tài khoản</th>
                    <th className="py-3 px-4">Họ và Tên</th>
                    <th className="py-3 px-4">Email liên hệ</th>
                    <th className="py-3 px-4">Số điện thoại</th>
                    <th className="py-3 px-4 text-center">Trạng thái tài khoản</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {isLoading ? (
                    <tr><td colSpan={6} className="text-center py-12 text-slate-400">Đang truy xuất thông tin cấu trúc người dùng...</td></tr>
                  ) : userPage?.content.map((user) => (
                    <tr key={user.userId} className="hover:bg-slate-50/40">
                      <td className="py-3.5 px-4 text-slate-400">#{user.userId}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{user.username}</td>
                      <td className="py-3.5 px-4 text-slate-700">{user.fullName}</td>
                      <td className="py-3.5 px-4 text-slate-500">{user.email}</td>
                      <td className="py-3.5 px-4 text-slate-500">{user.phone || '—'}</td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(user.userId, user.isActive)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border transition-colors cursor-pointer ${
                            user.isActive 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200' 
                              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
                          }`}
                        >
                          {user.isActive ? (
                            <>
                              <UserCheck className="w-3 h-3" /> Đang hoạt động
                            </>
                          ) : (
                            <>
                              <UserX className="w-3 h-3" /> Đã khoá
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PHÂN TRANG CHUẨN JPA THANKS TO SPRING BOOT */}
            {userPage && userPage.totalPages > 1 && (
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Tổng số: {userPage.totalElements} tài khoản</span>
                <div className="flex items-center gap-1">
                  <button 
                    disabled={currentPage === 0} 
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-xs disabled:opacity-40"
                  >
                    Trước
                  </button>
                  <span className="px-3 py-1.5">Trang {currentPage + 1} / {userPage.totalPages}</span>
                  <button 
                    disabled={currentPage >= userPage.totalPages - 1} 
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-xs disabled:opacity-40"
                  >
                    Kế tiếp
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}