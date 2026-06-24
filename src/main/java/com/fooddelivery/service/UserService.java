package com.fooddelivery.service;

import com.fooddelivery.dto.request.ChangePasswordRequest;
import com.fooddelivery.dto.request.UpdateProfileRequest;
import com.fooddelivery.dto.response.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
    UserResponse getProfile(Integer userId);
    UserResponse updateProfile(Integer userId, UpdateProfileRequest request);
    void changePassword(Integer userId, ChangePasswordRequest request);
    Page<UserResponse> getAllUsers(Pageable pageable);
    UserResponse toggleUserActive(Integer userId, boolean active);
}
