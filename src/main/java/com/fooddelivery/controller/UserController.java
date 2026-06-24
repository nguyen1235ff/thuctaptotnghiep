package com.fooddelivery.controller;

import com.fooddelivery.dto.request.ChangePasswordRequest;
import com.fooddelivery.dto.request.UpdateProfileRequest;
import com.fooddelivery.dto.response.UserResponse;
import com.fooddelivery.security.UserPrincipal;
import com.fooddelivery.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@AllArgsConstructor
@Tag(name = "User", description = "API quản lý người dùng")
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    @Operation(summary = "Lấy thông tin cá nhân", description = "Lấy profile của người dùng đang đăng nhập")
    public ResponseEntity<UserResponse> getProfile(Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return ResponseEntity.ok(userService.getProfile(principal.getUserId()));
    }

    @PutMapping("/profile")
    @Operation(summary = "Cập nhật thông tin cá nhân", description = "Cập nhật profile người dùng")
    public ResponseEntity<UserResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication) {

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return ResponseEntity.ok(userService.updateProfile(principal.getUserId(), request));
    }

    @PutMapping("/change-password")
    @Operation(summary = "Đổi mật khẩu", description = "Đổi mật khẩu tài khoản")
    public ResponseEntity<Void> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        userService.changePassword(principal.getUserId(), request);
        return ResponseEntity.noContent().build();
    }
}
