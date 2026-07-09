import { api } from './api';
import type { PageResponse } from './voucher'; 

// 1. DTO NHẬN VỀ: Ánh xạ chính xác 100% từ FoodResponse.java của Backend
export interface Food {
  foodId: number;
  foodName: string;      // ✅ Đã sửa từ name -> foodName
  description: string;
  price: number;
  imageUrl: string;      // ✅ Đã sửa từ image -> imageUrl
  categoryId: number;
  categoryName?: string; // Nhận thêm tên danh mục từ BE nếu cần hiển thị nhãn
  restaurantId: number;
  isAvailable: boolean;
}

// 2. DTO GỬI LÊN: Ánh xạ chính xác 100% từ CreateFoodRequest.java của Backend
export interface CreateFoodRequest {
  foodName: string;
  description?: string;
  price: number;
  categoryId: number;
  imageUrl?: string;
}

export const foodService = {
  // 1. LẤY DANH SÁCH MÓN ĂN THEO ID NHÀ HÀNG - GET /foods/restaurant/{restaurantId}
  getByRestaurantId: async (restaurantId: number, page = 0, size = 20): Promise<PageResponse<Food>> => {
    const response = await api.get<PageResponse<Food>>(`/foods/restaurant/${restaurantId}`, {
      params: { page, size }
    });
    return response.data;
  },

  // 2. THÊM MÓN ĂN MỚI CHO NHÀ HÀNG - POST /foods/restaurant/{restaurantId}
  create: async (restaurantId: number, foodData: CreateFoodRequest): Promise<Food> => {
    const response = await api.post<Food>(`/foods/restaurant/${restaurantId}`, foodData);
    return response.data;
  },

  // 3. CẬP NHẬT THÔNG TIN MÓN ĂN - PUT /foods/{id}
  update: async (id: number, foodData: Partial<CreateFoodRequest>): Promise<Food> => {
    const response = await api.put<Food>(`/foods/${id}`, foodData);
    return response.data;
  },

  // 4. XÓA MÓN ĂN KHỎI THỰC ĐƠN - DELETE /foods/{id}
  delete: async (id: number): Promise<void> => {
    await api.delete(`/foods/${id}`);
  }
};