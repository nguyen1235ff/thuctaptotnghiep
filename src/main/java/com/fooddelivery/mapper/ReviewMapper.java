package com.fooddelivery.mapper;

import com.fooddelivery.dto.response.ReviewResponse;
import com.fooddelivery.entity.Review;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReviewMapper {

    @Mapping(target = "customerName", source = "customer.fullName")
    ReviewResponse toReviewResponse(Review review);
}
