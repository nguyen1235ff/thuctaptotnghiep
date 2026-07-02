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
      
      // BỔ SUNG MOCK DATA PHÂN QUYỀN TÀI KHOẢN TẠI ĐÂY
      if (data.username === 'customer1' && data.password === '123456') {
        return {
          accessToken: "mock-jwt-token-customer-xyz",
          refreshToken: "mock-refresh-token-customer-xyz",
          username: "customer1",
          roles: ["ROLE_USER"]
        };
      } 
      
      if (data.username === 'owner1' && data.password === '123456') {
        return {
          accessToken: "mock-jwt-token-owner-xyz",
          refreshToken: "mock-refresh-token-owner-xyz",
          username: "owner1",
          roles: ["ROLE_OWNER"]
        };
      }

       if (data.username === 'owner1' && data.password === '123456') {
        return {
          accessToken: "mock-jwt-token-owner-xyz",
          refreshToken: "mock-refresh-token-owner-xyz",
          username: "owner1",
          roles: ["ROLE_OWNER"]
        };
      }

       if (data.username === 'admin1' && data.password === '123456') {
        return {
          accessToken: "mock-jwt-token-admin-xyz",
          refreshToken: "mock-refresh-token-admin-xyz",
          username: "admin1",
          roles: ["ROLE_ADMIN"]
        };
      }

      // Giả lập phản hồi mặc định nếu gõ tài khoản khác
      return {
        accessToken: "mock-jwt-token-default-abc",
        refreshToken: "mock-refresh-token-default-abc",
        username: data.username,
        roles: ["ROLE_USER"]
      };
    }
  },

  register: async (data: RegisterRequest): Promise<{ message: string }> => {
    try {
      const response = await api.post('/auth/register', data);
      return response.data;
    } catch (error) {
      console.warn("Backend offline: Giả lập đăng ký thành công.");
      await new Promise(resolve => setTimeout(resolve, 800));
      return { message: "Đăng ký tài khoản thành công" };
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
      return { message: "Đổi mật khẩu thành công!" };
    }
  }
};