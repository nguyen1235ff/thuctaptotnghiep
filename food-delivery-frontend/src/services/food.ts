import { api } from './api';
import type { PageResponse } from './voucher'; // Import để sử dụng cấu trúc phân trang PageResponse { content: T[] }

export interface Food {
  foodId: number;
  name: string;        
  description: string;
  price: number;
  image: string;       
  categoryId?: number;
  restaurantId: number;
  isAvailable?: boolean;
}

export const foodService = {
  // Thêm/Sửa hàm lấy món ăn theo ID nhà hàng để trả về Mock Data
  getByRestaurantId: async (restaurantId: number, page = 0, size = 20): Promise<PageResponse<Food>> => {
    try {
      const response = await api.get<PageResponse<Food>>(`/foods/restaurant/${restaurantId}`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.warn(`Chưa kết nối API món ăn, trả về Mock Data cho quán #${restaurantId}:`);
      return {
        content: [
          {
            foodId: 101,
            name: "Cơm Tấm Sườn Bì Chả",
            description: "Sườn nướng mật ong thơm lừng kết hợp bì thính và chả trứng đúc truyền thống.",
            price: 45000,
            image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500",
            categoryId: 1,
            restaurantId: restaurantId,
            isAvailable: true
          },
          {
            foodId: 102,
            name: "Cơm Tấm Sườn Non Nướng",
            description: "Sườn non chặt khúc ướp gia vị đậm đà nướng than hồng.",
            price: 55000,
            image: "https://images.unsplash.com/photo-1543352650-9ec89e12e5f6?w=500",
            categoryId: 1,
            restaurantId: restaurantId,
            isAvailable: true
          },
          {
            foodId: 103,
            name: "Canh Khổ Qua Nhồi Thịt",
            description: "Canh khổ qua thanh mát, giải nhiệt, nhồi thịt băm nguyên chất.",
            price: 15000,
            image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=500",
            categoryId: 2,
            restaurantId: restaurantId,
            isAvailable: true
          },
          {
            foodId: 104,
            name: "Trà Đá Chanh Sả",
            description: "Nước cốt chanh tươi kết hợp hương sả thơm mát.",
            price: 12000,
            image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500",
            categoryId: 3,
            restaurantId: restaurantId,
            isAvailable: true
          }
        ],
        totalPages: 1,
        totalElements: 4,
        size: size,
        number: page
      };
    }
  },


  // 2. THÊM MÓN ĂN MỚI CHO NHÀ HÀNG
  // POST: /foods/restaurant/{restaurantId}
  create: async (restaurantId: number, foodData: Omit<Food, 'foodId' | 'restaurantId'>): Promise<Food> => {
    const response = await api.post<Food>(`/foods/restaurant/${restaurantId}`, foodData);
    return response.data;
  },

  // 3. CẬP NHẬT MÓN ĂN
  // PUT: /foods/{id}
  update: async (foodId: number, foodData: Partial<Food>): Promise<Food> => {
    const response = await api.put<Food>(`/foods/${foodId}`, foodData);
    return response.data;
  },

  // 4. XÓA MÓN ĂN
  // DELETE: /foods/{id}
  delete: async (foodId: number): Promise<boolean> => {
    await api.delete(`/foods/${foodId}`);
    return true;
  }
};