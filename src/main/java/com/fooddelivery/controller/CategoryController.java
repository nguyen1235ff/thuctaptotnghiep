package com.fooddelivery.controller;

import com.fooddelivery.dto.response.CategoryResponse;
import com.fooddelivery.security.UserPrincipal;
import com.fooddelivery.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
@AllArgsConstructor
@Tag(name = "Category", description = "API quản lý danh mục")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("/restaurant/{restaurantId}")
    @Operation(summary = "Lấy danh sách danh mục", description = "Lấy danh sách danh mục của nhà hàng")
    public ResponseEntity<List<CategoryResponse>> getCategoriesByRestaurant(
            @PathVariable Integer restaurantId) {

        List<CategoryResponse> categories = categoryService.getCategoriesByRestaurant(restaurantId);
        return ResponseEntity.ok(categories);
    }

    @PostMapping("/{restaurantId}")
    @PreAuthorize("hasRole('RESTAURANT')")
    @Operation(summary = "Tạo danh mục", description = "Tạo danh mục mới")
    public ResponseEntity<CategoryResponse> createCategory(
            @PathVariable Integer restaurantId,
            @RequestParam @NotBlank(message = "Tên danh mục không được để trống") String categoryName,
            Authentication authentication) {

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        CategoryResponse category = categoryService.createCategory(
                restaurantId, categoryName, userPrincipal.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(category);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RESTAURANT')")
    @Operation(summary = "Cập nhật danh mục", description = "Cập nhật thông tin danh mục")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Integer id,
            @RequestParam @NotBlank(message = "Tên danh mục không được để trống") String categoryName,
            Authentication authentication) {

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        CategoryResponse category = categoryService.updateCategory(
                id, categoryName, userPrincipal.getUserId());
        return ResponseEntity.ok(category);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RESTAURANT')")
    @Operation(summary = "Xóa danh mục", description = "Xóa danh mục")
    public ResponseEntity<Void> deleteCategory(
            @PathVariable Integer id,
            Authentication authentication) {

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        categoryService.deleteCategory(id, userPrincipal.getUserId());
        return ResponseEntity.noContent().build();
    }
}