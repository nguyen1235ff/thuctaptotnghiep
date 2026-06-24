package com.fooddelivery.controller;

import com.fooddelivery.dto.request.CreateReviewRequest;
import com.fooddelivery.dto.response.ReviewResponse;
import com.fooddelivery.security.UserPrincipal;
import com.fooddelivery.service.ReviewService;
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
@RequestMapping("/reviews")
@AllArgsConstructor
@Tag(name = "Review", description = "API quản lý đánh giá")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/{orderId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Tạo đánh giá", description = "Tạo đánh giá cho đơn hàng")
    public ResponseEntity<ReviewResponse> createReview(
            @Parameter(description = "ID đơn hàng")
            @PathVariable Integer orderId,
            @Valid @RequestBody CreateReviewRequest request,
            Authentication authentication) {

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        ReviewResponse review = reviewService.createReview(orderId, userPrincipal.getUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(review);
    }

    @GetMapping("/restaurant/{restaurantId}")
    @Operation(summary = "Lấy danh sách đánh giá", description = "Lấy danh sách đánh giá của nhà hàng")
    public ResponseEntity<Page<ReviewResponse>> getRestaurantReviews(
            @Parameter(description = "ID nhà hàng")
            @PathVariable Integer restaurantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<ReviewResponse> reviews = reviewService.getRestaurantReviews(restaurantId, pageable);
        return ResponseEntity.ok(reviews);
    }
}