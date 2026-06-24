package com.fooddelivery.mapper;

import com.fooddelivery.dto.response.CategoryResponse;
import com.fooddelivery.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    @Mapping(target = "restaurantId", source = "restaurant.restaurantId")
    CategoryResponse toCategoryResponse(Category category);
}
