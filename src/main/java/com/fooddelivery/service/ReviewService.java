package com.fooddelivery.service;

import com.fooddelivery.dto.request.CreateReviewRequest;
import com.fooddelivery.dto.response.ReviewResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReviewService {
    ReviewResponse createReview(Integer orderId, Integer userId, CreateReviewRequest request);
    Page<ReviewResponse> getRestaurantReviews(Integer restaurantId, Pageable pageable);
}