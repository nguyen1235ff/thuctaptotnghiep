package com.fooddelivery.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestaurantResponse {

    private Integer restaurantId;
    private String restaurantName;
    private String description;
    private String address;
    private String phone;
    private String email;
    private String ownerName;
    private BigDecimal rating;
    private Integer totalReviews;
    private BigDecimal deliveryFee;
    private BigDecimal minOrderValue;
    private String imageUrl;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}