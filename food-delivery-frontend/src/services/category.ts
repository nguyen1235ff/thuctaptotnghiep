import { api } from './api';

// Ánh xạ chính xác từ thực thể CategoryResponse của Backend
export interface Category {
  categoryId: number;
  categoryName: string;
  description?: string;
  imageUrl?: string;
  displayOrder?: number;
}

export const categoryService = {
  // 1. LẤY DANH SÁCH DANH MỤC MÓN CỦA NHÀ HÀNG (Trả về mảng phẳng trực tiếp)
  // BE Endpoint: GET /categories/restaurant/{restaurantId}
  getByRestaurantId: async (restaurantId: number): Promise<Category[]> => {
    const response = await api.get<Category[]>(`/categories/restaurant/${restaurantId}`);
    return response.data; // Trả về mảng Category[] trực tiếp, không có .content
  },

  // 2. TẠO DANH MỤC MỚI CHO NHÀ HÀNG (Dành cho Chủ quán - Merchant)
  // BE Endpoint: POST /categories/{restaurantId}?categoryName=...
  create: async (restaurantId: number, categoryName: string): Promise<Category> => {
    // Truyền dữ liệu qua Params theo cấu trúc @RequestParam của Spring Boot
    const response = await api.post<Category>(`/categories/${restaurantId}`, null, {
      params: { categoryName }
    });
    return response.data;
  },

  // 3. CẬP NHẬT THÔNG TIN DANH MỤC
  // BE Endpoint: PUT /categories/{id}?categoryName=...
  update: async (id: number, categoryName: string): Promise<Category> => {
    const response = await api.put<Category>(`/categories/${id}`, null, {
      params: { categoryName }
    });
    return response.data;
  },

  // 4. XÓA DANH MỤC KHỎI NHÀ HÀNG
  // BE Endpoint: DELETE /categories/{id}
  delete: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  }
};