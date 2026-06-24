package com.fooddelivery.mapper;

import com.fooddelivery.dto.response.RestaurantResponse;
import com.fooddelivery.entity.Restaurant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RestaurantMapper {

    @Mapping(target = "ownerName", source = "owner.fullName")
    RestaurantResponse toRestaurantResponse(Restaurant restaurant);
}
