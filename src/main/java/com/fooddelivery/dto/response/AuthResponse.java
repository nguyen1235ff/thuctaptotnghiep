package com.fooddelivery.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * AuthResponse - Trả về sau khi đăng nhập/refresh token thành công.
 * Bao gồm token + thông tin user để frontend biết role và redirect đúng trang.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String accessToken;
    private String refreshToken;
    @Builder.Default
    private String tokenType = "Bearer";
    private Long expiresIn;

    // Thông tin user (roles) để frontend redirect đúng trang sau login
    private UserResponse user;
}