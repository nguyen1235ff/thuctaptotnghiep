import axios from 'axios';

// Định nghĩa URL gốc của Spring Boot backend. 
// Lưu ý: Nếu trong file application.yml bạn có đặt context-path (ví dụ: /api), hãy sửa lại thành 'http://localhost:8080/api'
const API_BASE_URL = 'http://localhost:8080'; 

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor 1: Tự động đính kèm Access Token (JWT) vào Header trước khi gửi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor 2: Tự động xử lý Refresh Token khi Access Token hết hạn (Lỗi 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Nếu gặp lỗi 401 (Hết hạn token) và request này chưa từng thực hiện thử lại (_retry)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Đánh dấu đã thử lại để tránh lặp vô tận
      
      try {
        const storedRefreshToken = localStorage.getItem('refreshToken');
        
        if (!storedRefreshToken) {
          throw new Error('No refresh token found');
        }

        // Gọi chính xác API /auth/refresh-token với cấu trúc body của RefreshTokenRequest.java
        const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken: storedRefreshToken
        });

        if (res.status === 200) {
          // Giả định AuthResponse từ Backend trả về dạng object có accessToken và refreshToken
          const { accessToken, refreshToken: newRefreshToken } = res.data;
          
          // Cập nhật lại vào localStorage
          localStorage.setItem('accessToken', accessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }
          
          // Gắn token mới vào request hiện tại và thực thi lại request cũ
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Nếu Refresh Token cũng thất bại hoặc hết hạn -> Xóa sạch session và đá về trang login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);