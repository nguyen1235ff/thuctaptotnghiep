import { api } from './api';
import type { PageResponse } from './voucher'; 

// 1. DTO NHẬN VỀ: Ánh xạ chính xác thực thể từ RestaurantResponse.java của Backend
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

// 2. DTO GỬI LÊN: ✨ THÊM MỚI INTERFACE NÀY (Khớp hoàn toàn với CreateRestaurantRequest.java)
export interface CreateRestaurantRequest {
  restaurantName: string;
  description?: string;
  address: string;
  phone: string;
  email?: string;
  deliveryFee: number;
  minOrderValue: number;
  imageUrl?: string;
  isActive?: boolean;
}

export const restaurantService = {
  // 1. BE Endpoint: GET /restaurants
  getAllRestaurants: async (page = 0, size = 10): Promise<PageResponse<RestaurantResponse>> => {
    const response = await api.get<PageResponse<RestaurantResponse>>('/restaurants', {
      params: { page, size }
    });
    return response.data;
  },

  // 2. BE Endpoint: GET /restaurants/management/my-restaurants
  getMyRestaurants: async (page = 0, size = 10): Promise<PageResponse<RestaurantResponse>> => {
    const response = await api.get<PageResponse<RestaurantResponse>>('/restaurants/management/my-restaurants', {
      params: { page, size }
    });
    return response.data;
  },

  // 3. ✨ ĐÃ SỬA: Thay đổi kiểu dữ liệu nhận vào thành Partial<CreateRestaurantRequest> để chặn các trường thừa
  // BE Endpoint: PUT /restaurants/{id}
  updateRestaurant: async (id: number, data: Partial<CreateRestaurantRequest>): Promise<RestaurantResponse> => {
    const response = await api.put<RestaurantResponse>(`/restaurants/${id}`, data);
    return response.data;
  },

  // 4. BE Endpoint: DELETE /restaurants/{id}
  deleteRestaurant: async (id: number): Promise<void> => {
    await api.delete(`/restaurants/${id}`);
  },

  // 5. BE Endpoint: GET /restaurants/{id}
  getById: async (id: number): Promise<RestaurantResponse> => {
    const response = await api.get<RestaurantResponse>(`/restaurants/${id}`);
    return response.data;
  }
};