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
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | string; // Khớp cấu trúc của trường dữ liệu BE
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
}

export const voucherService = {
  // ==========================================
  // 1. DÀNH CHO KHÁCH HÀNG (VoucherController)
  // ==========================================

  // GET: /vouchers?page=...&size=...
  getAllAvailable: async (page = 0, size = 10): Promise<PageResponse<VoucherResponse>> => {
    try {
      const response = await api.get<PageResponse<VoucherResponse>>('/vouchers', {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.warn("Chưa có API client, dùng Mock Data:");
      return {
        content: [
          { voucherId: 1, voucherCode: "CHAOHE2026", description: "Giảm 20k cho đơn từ 100k", discountType: "FIXED_AMOUNT", discountValue: 20000, minOrderValue: 100000, usedCount: 5, startDate: "2026-06-01T00:00:00", endDate: "2026-08-30T23:59:59", isActive: true },
          { voucherId: 2, voucherCode: "FREESHIP", description: "Giảm 15k cho đơn từ 50k", discountType: "FIXED_AMOUNT", discountValue: 15000, minOrderValue: 50000, usedCount: 12, startDate: "2026-06-01T00:00:00", endDate: "2026-07-15T23:59:59", isActive: true }
        ],
        totalPages: 1, totalElements: 2, size: 10, number: 0
      };
    }
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
    try {
      const response = await api.get<PageResponse<VoucherResponse>>('/admin/vouchers', {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.warn("Chưa có API admin, dùng Mock Data:");
      return {
        content: [
          { voucherId: 1, voucherCode: "CHAOHE2026", description: "Giảm 20k cho đơn từ 100k", discountType: "FIXED_AMOUNT", discountValue: 20000, minOrderValue: 100000, maxUses: 100, usedCount: 5, startDate: "2026-06-01T00:00", endDate: "2026-08-30T23:59", isActive: true },
          { voucherId: 2, voucherCode: "FREESHIP", description: "Giảm 15k cho đơn từ 50k", discountType: "FIXED_AMOUNT", discountValue: 15000, minOrderValue: 50000, maxUses: 200, usedCount: 12, startDate: "2026-06-01T00:00", endDate: "2026-07-15T23:59", isActive: true }
        ],
        totalPages: 1, totalElements: 2, size: 20, number: 0
      };
    }
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