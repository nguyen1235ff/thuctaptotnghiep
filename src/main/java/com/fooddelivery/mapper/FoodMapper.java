package com.fooddelivery.mapper;

import com.fooddelivery.dto.response.FoodResponse;
import com.fooddelivery.entity.Food;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface FoodMapper {

    @Mapping(target = "categoryName", source = "category.categoryName")
    @Mapping(target = "restaurantId", source = "restaurant.restaurantId")
    FoodResponse toFoodResponse(Food food);
}
