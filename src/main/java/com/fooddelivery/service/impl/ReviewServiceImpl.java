package com.fooddelivery.service.impl;

import com.fooddelivery.dto.request.CreateReviewRequest;
import com.fooddelivery.dto.response.ReviewResponse;
import com.fooddelivery.entity.Order;
import com.fooddelivery.entity.Review;
import com.fooddelivery.entity.Restaurant;
import com.fooddelivery.entity.User;
import com.fooddelivery.exception.BadRequestException;
import com.fooddelivery.exception.ForbiddenException;
import com.fooddelivery.exception.ResourceNotFoundException;
import com.fooddelivery.mapper.ReviewMapper;
import com.fooddelivery.repository.*;
import com.fooddelivery.service.ReviewService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@AllArgsConstructor
@Slf4j
@Transactional
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;
    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;
    private final ReviewMapper reviewMapper;

    @Override
    public ReviewResponse createReview(Integer orderId, Integer userId, CreateReviewRequest request) {
        log.info("Tạo đánh giá cho đơn hàng: {} từ người dùng: {}", orderId, userId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng", "id", orderId));

        // Check if user is customer
        if (!order.getCustomer().getUserId().equals(userId)) {
            throw new ForbiddenException("Bạn không có quyền đánh giá đơn hàng này");
        }

        // Check if order is completed
        if (!"COMPLETED".equals(order.getOrderStatus())) {
            throw new BadRequestException("Chỉ có thể đánh giá đơn hàng đã hoàn thành");
        }

        // Check if review already exists
        if (reviewRepository.findByOrderOrderId(orderId).isPresent()) {
            throw new BadRequestException("Đơn hàng này đã được đánh giá");
        }

        User customer = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", "id", userId));

        Restaurant restaurant = order.getRestaurant();

        // Create review
        Review review = Review.builder()
                .order(order)
                .customer(customer)
                .restaurant(restaurant)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        Review savedReview = reviewRepository.save(review);

        // Update restaurant rating
        updateRestaurantRating(restaurant.getRestaurantId());

        log.info("Tạo đánh giá thành công với ID: {}", savedReview.getReviewId());

        return reviewMapper.toReviewResponse(savedReview);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getRestaurantReviews(Integer restaurantId, Pageable pageable) {
        log.info("Lấy danh sách đánh giá của nhà hàng: {}", restaurantId);

        restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Nhà hàng", "id", restaurantId));

        Page<Review> reviews = reviewRepository.findByRestaurantRestaurantId(restaurantId, pageable);
        return reviews.map(reviewMapper::toReviewResponse);
    }

    private void updateRestaurantRating(Integer restaurantId) {
        Double averageRating = reviewRepository.getAverageRatingByRestaurant(restaurantId);
        Long totalReviews = reviewRepository.findByRestaurantRestaurantId(restaurantId,
                org.springframework.data.domain.Pageable.unpaged()).getTotalElements();

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Nhà hàng", "id", restaurantId));

        if (averageRating != null) {
            restaurant.setRating(new BigDecimal(String.valueOf(averageRating)));
        }
        restaurant.setTotalReviews(Math.toIntExact(totalReviews));

        restaurantRepository.save(restaurant);
    }
}