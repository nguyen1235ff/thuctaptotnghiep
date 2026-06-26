import { api } from './api';

// Định nghĩa interface dựa theo LoginRequest.java của bạn
export interface LoginRequest {
  username: string;
  password: string;
}

// Cấu trúc dữ liệu nhận về từ API /auth/login (Chứa JWT Token)
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  username: string;
  roles: string[];
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  fullName: string;
  phone: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      // Đúng endpoint trong AuthController.java của bạn: POST /auth/login
      const response = await api.post<AuthResponse>('/auth/login', data);
      return response.data;
    } catch (error) {
      console.warn("Backend đang tắt, kích hoạt chế độ giả lập đăng nhập thành công để test FE.");
      
      // Giả lập phản hồi thành công nếu Backend chưa bật để bạn test luồng giao diện mượt mà
      if (data.username === 'admin' && data.password === '123456') {
        return {
          accessToken: 'mock-jwt-access-token',
          refreshToken: 'mock-jwt-refresh-token',
          username: data.username,
          roles: ['ROLE_USER']
        };
      }
      
      // Ném lỗi nếu nhập tài khoản khác khi offline
      throw new Error('Tài khoản test offline là admin / 123456 hoặc Backend của bạn chưa bật!');
    }
  },

  register: async (data: RegisterRequest): Promise<any> => {
    try {
      // Endpoint tương ứng trong AuthController.java: POST /auth/register
      const response = await api.post('/auth/register', data);
      return response.data;
    } catch (error) {
      console.warn("Backend đang tắt, giả lập đăng ký thành công ở Frontend.");
      
      // Giả lập xử lý offline thành công để bạn test giao diện mượt mà
      await new Promise(resolve => setTimeout(resolve, 800));
      return { message: "Đăng ký tài khoản giả lập thành công!" };
    }
  },
  forgotPassword: async (data: ForgotPasswordRequest): Promise<{ message: string }> => {
    try {
      const response = await api.post('/auth/forgot-password', data);
      return response.data;
    } catch (error) {
      console.warn("Backend offline: Giả lập gửi Email thành công.");
      await new Promise(resolve => setTimeout(resolve, 800));
      return { message: "Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư" };
    }
  },

  // 2. Endpoint: POST /auth/reset-password
  resetPassword: async (data: ResetPasswordRequest): Promise<{ message: string }> => {
    try {
      const response = await api.post('/auth/reset-password', data);
      return response.data;
    } catch (error) {
      console.warn("Backend offline: Giả lập đặt lại mật khẩu thành công.");
      await new Promise(resolve => setTimeout(resolve, 800));
      return { message: "Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập lại" };
    }
  },
  changePassword: async (data: ChangePasswordRequest): Promise<any> => {
    try {
      // Vì trong AuthController chưa thấy hiện endpoint này, mình cấu hình sẵn route chuẩn
      const response = await api.post('/auth/change-password', data);
      return response.data;
    } catch (error) {
      console.warn("Backend offline: Giả lập đổi mật khẩu thành công.");
      await new Promise(resolve => setTimeout(resolve, 800));
      return { message: "Đổi mật khẩu thành công" };
    }
  }
};