import { api } from './api';
import type { PageResponse } from './voucher'; // Đảm bảo interface PageResponse { content: T[], totalPages: number, ... } hoạt động ổn định

// 1. Cấu trúc dữ liệu gửi lên Backend để tạo đánh giá (Khớp CreateReviewRequest.java ở BE)
export interface CreateReviewRequest {
  rating: number;       // Số sao đánh giá (Ví dụ: từ 1 đến 5)
  comment: string;      // Nội dung nhận xét, bình luận
}

// 2. Cấu trúc dữ liệu phản hồi đánh giá nhận về từ Backend (Khớp ReviewResponse.java ở BE)
export interface ReviewResponse {
  reviewId: number;
  orderId: number;
  username: string;
  rating: number;
  comment: string;
  reviewDate: string;
}

export const reviewService = {
  // 1. TẠO ĐÁNH GIÁ MỚI CHO ĐƠN HÀNG (Dành cho Khách hàng)
  // BE Endpoint: POST /reviews/{orderId}
  createReview: async (orderId: number, reviewData: CreateReviewRequest): Promise<ReviewResponse> => {
    const response = await api.post<ReviewResponse>(`/reviews/${orderId}`, reviewData);
    return response.data;
  },

  // 2. LẤY DANH SÁCH ĐÁNH GIÁ CỦA CỬA HÀNG PHÂN TRANG (Khách hàng & Chủ quán xem)
  // BE Endpoint: GET /reviews/restaurant/{restaurantId}
  getRestaurantReviews: async (restaurantId: number, page = 0, size = 10): Promise<PageResponse<ReviewResponse>> => {
    const response = await api.get<PageResponse<ReviewResponse>>(`/reviews/restaurant/${restaurantId}`, {
      params: { page, size }
    });
    return response.data; // Trả về cấu trúc Spring Boot Page, cần bóc tách .content ở Component UI
  }
};