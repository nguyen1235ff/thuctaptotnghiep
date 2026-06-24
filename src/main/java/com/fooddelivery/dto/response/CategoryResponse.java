package com.fooddelivery.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryResponse {

    private Integer categoryId;
    private String categoryName;
    private String description;
    private Integer restaurantId;
    private String imageUrl;
    private Integer displayOrder;
    private LocalDateTime createdAt;
}