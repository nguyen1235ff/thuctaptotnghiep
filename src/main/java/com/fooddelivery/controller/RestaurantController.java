package com.fooddelivery.controller;

import com.fooddelivery.dto.request.CreateRestaurantRequest;
import com.fooddelivery.dto.response.RestaurantResponse;
import com.fooddelivery.security.UserPrincipal;
import com.fooddelivery.service.RestaurantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/restaurants")
@AllArgsConstructor
@Tag(name = "Restaurant", description = "API quản lý nhà hàng")
public class RestaurantController {

    private final RestaurantService restaurantService;

    @GetMapping
    @Operation(summary = "Lấy danh sách nhà hàng", description = "Lấy danh sách nhà hàng với phân trang")
    public ResponseEntity<Page<RestaurantResponse>> getAllRestaurants(
            @Parameter(description = "Số trang (bắt đầu từ 0)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Số lượng records trên một trang")
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<RestaurantResponse> restaurants = restaurantService.getAllRestaurants(pageable);
        return ResponseEntity.ok(restaurants);
    }

    @GetMapping("/search")
    @Operation(summary = "Tìm kiếm nhà hàng", description = "Tìm kiếm nhà hàng theo tên hoặc địa chỉ")
    public ResponseEntity<Page<RestaurantResponse>> searchRestaurants(
            @Parameter(description = "Từ khóa tìm kiếm")
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<RestaurantResponse> restaurants = restaurantService.searchRestaurants(keyword, pageable);
        return ResponseEntity.ok(restaurants);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết nhà hàng", description = "Lấy thông tin chi tiết của một nhà hàng")
    public ResponseEntity<RestaurantResponse> getRestaurantById(
            @Parameter(description = "ID nhà hàng")
            @PathVariable Integer id) {

        RestaurantResponse restaurant = restaurantService.getRestaurantById(id);
        return ResponseEntity.ok(restaurant);
    }

    @PostMapping
    @PreAuthorize("hasRole('RESTAURANT')")
    @Operation(summary = "Tạo nhà hàng", description = "Tạo nhà hàng mới (chủ nhà hàng)")
    public ResponseEntity<RestaurantResponse> createRestaurant(
            @Valid @RequestBody CreateRestaurantRequest request,
            Authentication authentication) {

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        RestaurantResponse restaurant = restaurantService.createRestaurant(request, userPrincipal.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(restaurant);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RESTAURANT')")
    @Operation(summary = "Cập nhật nhà hàng", description = "Cập nhật thông tin nhà hàng")
    public ResponseEntity<RestaurantResponse> updateRestaurant(
            @PathVariable Integer id,
            @Valid @RequestBody CreateRestaurantRequest request,
            Authentication authentication) {

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        RestaurantResponse restaurant = restaurantService.updateRestaurant(
                id, request, userPrincipal.getUserId());
        return ResponseEntity.ok(restaurant);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RESTAURANT')")
    @Operation(summary = "Xóa nhà hàng", description = "Xóa nhà hàng")
    public ResponseEntity<Void> deleteRestaurant(
            @PathVariable Integer id,
            Authentication authentication) {

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        restaurantService.deleteRestaurant(id, userPrincipal.getUserId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/management/my-restaurants")
    @PreAuthorize("hasRole('RESTAURANT')")
    @Operation(summary = "Lấy nhà hàng của tôi", description = "Lấy danh sách nhà hàng do mình sở hữu")
    public ResponseEntity<Page<RestaurantResponse>> getMyRestaurants(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Pageable pageable = PageRequest.of(page, size);
        Page<RestaurantResponse> restaurants = restaurantService.getMyRestaurants(
                userPrincipal.getUserId(), pageable);
        return ResponseEntity.ok(restaurants);
    }
}