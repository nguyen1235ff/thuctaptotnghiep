package com.fooddelivery.controller;

import com.fooddelivery.dto.request.CreateFoodRequest;
import com.fooddelivery.dto.response.FoodResponse;
import com.fooddelivery.security.UserPrincipal;
import com.fooddelivery.service.FoodService;
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
@RequestMapping("/foods")
@AllArgsConstructor
@Tag(name = "Food", description = "API quản lý món ăn")
public class FoodController {

    private final FoodService foodService;

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết món ăn", description = "Lấy thông tin chi tiết của một món ăn")
    public ResponseEntity<FoodResponse> getFoodById(
            @Parameter(description = "ID món ăn")
            @PathVariable Integer id) {

        FoodResponse food = foodService.getFoodById(id);
        return ResponseEntity.ok(food);
    }

    @GetMapping("/restaurant/{restaurantId}")
    @Operation(summary = "Lấy danh sách món ăn", description = "Lấy danh sách món ăn của một nhà hàng")
    public ResponseEntity<Page<FoodResponse>> getFoodsByRestaurant(
            @PathVariable Integer restaurantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<FoodResponse> foods = foodService.getFoodsByRestaurant(restaurantId, pageable);
        return ResponseEntity.ok(foods);
    }

    @GetMapping("/restaurant/{restaurantId}/search")
    @Operation(summary = "Tìm kiếm món ăn", description = "Tìm kiếm món ăn trong nhà hàng")
    public ResponseEntity<Page<FoodResponse>> searchFoods(
            @PathVariable Integer restaurantId,
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<FoodResponse> foods = foodService.searchFoods(restaurantId, keyword, pageable);
        return ResponseEntity.ok(foods);
    }

    @GetMapping("/category/{categoryId}")
    @Operation(summary = "Lấy món ăn theo danh mục", description = "Lấy danh sách món ăn theo danh mục")
    public ResponseEntity<Page<FoodResponse>> getFoodsByCategory(
            @PathVariable Integer categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<FoodResponse> foods = foodService.getFoodsByCategory(categoryId, pageable);
        return ResponseEntity.ok(foods);
    }

    @PostMapping("/{restaurantId}")
    @PreAuthorize("hasRole('RESTAURANT')")
    @Operation(summary = "Tạo món ăn", description = "Tạo món ăn mới")
    public ResponseEntity<FoodResponse> createFood(
            @PathVariable Integer restaurantId,
            @Valid @RequestBody CreateFoodRequest request,
            Authentication authentication) {

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        FoodResponse food = foodService.createFood(restaurantId, request, userPrincipal.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(food);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RESTAURANT')")
    @Operation(summary = "Cập nhật món ăn", description = "Cập nhật thông tin món ăn")
    public ResponseEntity<FoodResponse> updateFood(
            @PathVariable Integer id,
            @Valid @RequestBody CreateFoodRequest request,
            Authentication authentication) {

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        FoodResponse food = foodService.updateFood(id, request, userPrincipal.getUserId());
        return ResponseEntity.ok(food);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RESTAURANT')")
    @Operation(summary = "Xóa món ăn", description = "Xóa món ăn")
    public ResponseEntity<Void> deleteFood(
            @PathVariable Integer id,
            Authentication authentication) {

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        foodService.deleteFood(id, userPrincipal.getUserId());
        return ResponseEntity.noContent().build();
    }
}