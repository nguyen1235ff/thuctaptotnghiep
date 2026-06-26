import { api } from './api';
import type { PageResponse } from './voucher'; // Tái sử dụng cấu trúc phân trang JPA đã có

// Ánh xạ chính xác thực thể Restaurant.java của Backend
export interface RestaurantResponse {
  restaurantId: number;
  restaurantName: string;
  description?: string;
  address: string;
  phone: string;
  email?: string;
  rating: number;
  totalReviews: number;
  deliveryFee: number;
  minOrderValue: number;
  isActive: boolean;
  imageUrl?: string;
}

export const restaurantService = {
  // 1. LẤY DANH SÁCH NHÀ HÀNG CHUNG TRÊN HỆ THỐNG (User thường xem)
  getAllRestaurants: async (page = 0, size = 10): Promise<PageResponse<RestaurantResponse>> => {
    try {
      const response = await api.get<PageResponse<RestaurantResponse>>('/restaurants', {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.warn("Chưa kết nối API hệ thống, trả về danh sách nhà hàng chung Mock:");
      return {
        content: [
          {
            restaurantId: 1,
            restaurantName: "Cơm Tấm Phúc Lộc Thọ - Long Bình",
            description: "Ăn Phúc Lộc Thọ, rạng ngời văn hóa Việt. Chuyên các món cơm tấm sườn nướng.",
            address: "Đường Nguyễn Xiển, Phường Long Bình, TP. Thủ Đức, TP.HCM",
            phone: "19006552",
            email: "contact@phucloctho.vn",
            rating: 4.8,
            totalReviews: 120,
            deliveryFee: 15000,
            minOrderValue: 40000,
            isActive: true,
            imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600"
          },
          {
            restaurantId: 2,
            restaurantName: "Bún Bò Huế Ngự Uyển",
            description: "Hương vị chuẩn cố đô Huế, nước dùng đậm đà thơm mùi mắm ruốc.",
            address: "Khu dân cư Phước Thiện, Phường Long Bình, TP. Thủ Đức",
            phone: "0908123456",
            email: "nguyuyen@gmail.com",
            rating: 4.5,
            totalReviews: 85,
            deliveryFee: 18000,
            minOrderValue: 35000,
            isActive: true,
            imageUrl: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600"
          }
        ],
        totalPages: 1,
        totalElements: 2,
        size: size,
        number: page
      };
    }
  },

  // 2. LẤY DANH SÁCH NHÀ HÀNG DO TÀI KHOẢN ĐANG ĐĂNG NHẬP SỞ HỮU (Dành cho Admin Dashboard)
  getMyRestaurants: async (page = 0, size = 10): Promise<PageResponse<RestaurantResponse>> => {
    try {
      const response = await api.get<PageResponse<RestaurantResponse>>('/restaurants/management/my-restaurants', {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.warn("Chưa kết nối API quản lý, trả về danh sách nhà hàng sở hữu Mock:");
      // Trả về dữ liệu mock chứa nhà hàng có ID tương ứng để khi click vào sẽ xem được chi tiết
      return {
        content: [
          {
            restaurantId: 1, // Khớp với ID trong foodService và categoryService đã mock
            restaurantName: "Cơm Tấm Phúc Lộc Thọ - Long Bình",
            description: "Cửa hàng đang quản lý trực tiếp bởi bạn.",
            address: "Đường Nguyễn Xiển, Phường Long Bình, TP. Thủ Đức, TP.HCM",
            phone: "19006552",
            email: "manager.longbinh@phucloctho.vn",
            rating: 4.8,
            totalReviews: 120,
            deliveryFee: 15000,
            minOrderValue: 40000,
            isActive: true,
            imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600"
          }
        ],
        totalPages: 1,
        totalElements: 1,
        size: size,
        number: page
      };
    }
  },

  // 3. CẬP NHẬT THÔNG TIN NHÀ HÀNG (Ví dụ đóng/mở cửa, sửa thông tin)
  updateRestaurant: async (id: number, data: Partial<RestaurantResponse>): Promise<RestaurantResponse> => {
    try {
      const response = await api.put<RestaurantResponse>(`/restaurants/${id}`, data);
      return response.data;
    } catch (error) {
      console.warn(`Giả lập cập nhật trạng thái/thông tin thành công cho nhà hàng #${id}`);
      return {
        restaurantId: id,
        restaurantName: "Cơm Tấm Phúc Lộc Thọ - Long Bình",
        address: "Đường Nguyễn Xiển, Phường Long Bình, TP. Thủ Đức, TP.HCM",
        phone: "19006552",
        rating: 4.8,
        totalReviews: 120,
        deliveryFee: 15000,
        minOrderValue: 40000,
        isActive: data.isActive !== undefined ? data.isActive : true,
        ...data
      } as RestaurantResponse;
    }
  }
};

//   // 4. XÓA NHÀ HÀNG
//   // DELETE: /restaurants/{id}
//   deleteRestaurant: async (id: number): Promise<boolean> => {
//     await api.delete(`/restaurants/${id}`);
//     return true;
//   }
// };