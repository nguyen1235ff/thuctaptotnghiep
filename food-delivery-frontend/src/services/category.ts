import { api } from './api';

// Ánh xạ chính xác từ thực thể Category.java của Backend
export interface Category {
  categoryId: number;
  categoryName: string;
  description?: string;
  imageUrl?: string;
  displayOrder?: number;
}

export const categoryService = {
  getByRestaurantId: async (restaurantId: number): Promise<Category[]> => {
    try {
      const response = await api.get<Category[]>(`/categories/restaurant/${restaurantId}`);
      return response.data;
    } catch (error) {
      console.warn("Chưa kết nối được BE, trả về Mock Data danh mục:");
      return [
        { categoryId: 1, categoryName: "🍔 Món chính (Cơm Tấm)", description: "Các món cơm đĩa no bụng", displayOrder: 1 },
        { categoryId: 2, categoryName: "🍲 Món canh / Gọi thêm", description: "Canh khổ qua, canh cải, trứng ốp la", displayOrder: 2 },
        { categoryId: 3, categoryName: "🥤 Tráng miệng & Nước", description: "Trà sâm dứa, trà chanh, nước ngọt", displayOrder: 3 },
      ];
    }
  },

  // POST: /categories/{restaurantId}?categoryName=...
  create: async (restaurantId: number, categoryName: string): Promise<Category> => {
    // Truyền dữ liệu qua Params theo cấu trúc @RequestParam của Spring Boot
    const response = await api.post<Category>(`/categories/${restaurantId}`, null, {
      params: { categoryName }
    });
    return response.data;
  },

  // PUT: /categories/{id}?categoryName=...
  update: async (id: number, categoryName: string): Promise<Category> => {
    const response = await api.put<Category>(`/categories/${id}`, null, {
      params: { categoryName }
    });
    return response.data;
  },

  // DELETE: /categories/{id}
  delete: async (id: number): Promise<boolean> => {
    await api.delete(`/categories/${id}`);
    return true;
  }
};