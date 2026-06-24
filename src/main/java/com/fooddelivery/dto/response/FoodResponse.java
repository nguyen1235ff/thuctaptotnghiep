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
public class FoodResponse {

    private Integer foodId;
    private String foodName;
    private String description;
    private BigDecimal price;
    private String imageUrl;
    private Integer categoryId;
    private String categoryName;
    private Integer restaurantId;
    private Boolean isAvailable;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}