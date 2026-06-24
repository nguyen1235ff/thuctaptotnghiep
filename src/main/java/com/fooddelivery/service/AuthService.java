package com.fooddelivery.service;

import com.fooddelivery.dto.request.ForgotPasswordRequest;
import com.fooddelivery.dto.request.LoginRequest;
import com.fooddelivery.dto.request.RefreshTokenRequest;
import com.fooddelivery.dto.request.RegisterRequest;
import com.fooddelivery.dto.request.ResetPasswordRequest;
import com.fooddelivery.dto.response.AuthResponse;
import com.fooddelivery.dto.response.UserResponse;

public interface AuthService {
    UserResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refreshToken(RefreshTokenRequest request);
    void logout(Integer userId);
    UserResponse getCurrentUser(Integer userId);
    void forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
}