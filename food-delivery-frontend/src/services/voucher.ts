import { api } from './api';

// Định nghĩa cấu trúc phân trang JPA dùng chung cho hệ thống
export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

// Ánh xạ chính xác từ Voucher.java và VoucherResponse của Backend
export interface VoucherResponse {
  voucherId: number;
  voucherCode: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | string; 
  discountValue: number;
  minOrderValue: number;
  maxUses?: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

// DTO gửi lên khi tạo/sửa Voucher (Khớp cấu trúc dữ liệu của VoucherRequest)
export interface VoucherRequest {
  voucherCode: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | string;
  discountValue: number;
  minOrderValue: number;
  maxUses?: number;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

export const voucherService = {
  // ==========================================
  // 1. DÀNH CHO KHÁCH HÀNG (VoucherController)
  // ==========================================

  // GET: /vouchers?page=...&size=...
  getAllAvailable: async (page = 0, size = 10): Promise<PageResponse<VoucherResponse>> => {
    const response = await api.get<PageResponse<VoucherResponse>>('/vouchers', {
      params: { page, size }
    });
    return response.data;
  },

  // GET: /vouchers/{code}
  getByCode: async (code: string): Promise<VoucherResponse> => {
    const response = await api.get<VoucherResponse>(`/vouchers/${code}`);
    return response.data;
  },

  // ==========================================
  // 2. DÀNH CHO ADMIN (AdminController)
  // ==========================================

  // GET: /admin/vouchers?page=...&size=...
  getAllAdmin: async (page = 0, size = 20): Promise<PageResponse<VoucherResponse>> => {
    const response = await api.get<PageResponse<VoucherResponse>>('/admin/vouchers', {
      params: { page, size }
    });
    return response.data;
  },

  // POST: /admin/vouchers
  create: async (data: VoucherRequest): Promise<VoucherResponse> => {
    const response = await api.post<VoucherResponse>('/admin/vouchers', data);
    return response.data;
  },

  // PUT: /admin/vouchers/{id}
  update: async (id: number, data: VoucherRequest): Promise<VoucherResponse> => {
    const response = await api.put<VoucherResponse>(`/admin/vouchers/${id}`, data);
    return response.data;
  },

  // DELETE: /admin/vouchers/{id}
  delete: async (id: number): Promise<boolean> => {
    await api.delete(`/admin/vouchers/${id}`);
    return true;
  }
};