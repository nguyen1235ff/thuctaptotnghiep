import { api } from './api';
import type { PageResponse } from './voucher'; // Dùng chung định dạng PageResponse phân trang

// 1. Cấu trúc dữ liệu gửi lên Backend để tạo đánh giá (Khớp CreateReviewRequest.java)
export interface CreateReviewRequest {
  rating: number;       // Số sao đánh giá (Ví dụ: 1 đến 5)
  comment: string;      // Nội dung nhận xét bài viết
}

// 2. Cấu trúc dữ liệu phản hồi đánh giá nhận về từ Backend (Khớp ReviewResponse.java)
export interface ReviewResponse {
  reviewId: number;
  orderId: number;
  username: string;
  rating: number;
  comment: string;
  reviewDate: string;
}

export const reviewService = {
  // TẠO ĐÁNH GIÁ MỚI CHO ĐƠN HÀNG (POST /reviews/{orderId})
  createReview: async (orderId: number, reviewData: CreateReviewRequest): Promise<ReviewResponse> => {
    const response = await api.post<ReviewResponse>(`/reviews/${orderId}`, reviewData);
    return response.data;
  },

  // LẤY DANH SÁCH ĐÁNH GIÁ CỦA CỬA HÀNG PHÂN TRANG (GET /reviews/restaurant/{restaurantId})
  getRestaurantReviews: async (restaurantId: number, page = 0, size = 10): Promise<PageResponse<ReviewResponse>> => {
    try {
      const response = await api.get<PageResponse<ReviewResponse>>(`/reviews/restaurant/${restaurantId}`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.warn(`⚠️ Backend offline hoặc chưa có review. Trả về dữ liệu Mock cho quán #${restaurantId}`);
      
      // Giả lập dữ liệu Review Mock để hiển thị bên trang chi tiết nhà hàng phía khách hàng
      return {
        content: [
          {
            reviewId: 1001,
            orderId: 501,
            username: "nguyenvan_a",
            rating: 5,
            comment: "Đồ ăn giao nhanh, đóng gói siêu cẩn thận, cơm sườn siêu ngon ngon thơm nức mũi luôn!",
            reviewDate: "2026-06-28T12:30:00"
          },
          {
            reviewId: 1002,
            orderId: 504,
            username: "hoangthi_b",
            rating: 4,
            comment: "Nước uống ngon mát nhưng đá hơi tan một chút do trời nắng nóng, tổng quan vẫn rất hài lòng.",
            reviewDate: "2026-07-01T15:45:00"
          }
        ],
        totalPages: 1,
        totalElements: 2,
        size: size,
        number: page
      };
    }
  }
};