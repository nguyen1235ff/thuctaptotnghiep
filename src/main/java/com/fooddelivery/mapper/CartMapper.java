package com.fooddelivery.mapper;

import com.fooddelivery.dto.response.CartItemResponse;
import com.fooddelivery.dto.response.CartResponse;
import com.fooddelivery.entity.Cart;
import com.fooddelivery.entity.CartItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CartMapper {

    @Mapping(target = "restaurantId", source = "restaurant.restaurantId")
    @Mapping(target = "restaurantName", source = "restaurant.restaurantName")
    @Mapping(target = "items", source = "items")
    CartResponse toCartResponse(Cart cart);

    @Mapping(target = "foodId", source = "food.foodId")
    @Mapping(target = "foodName", source = "food.foodName")
    CartItemResponse toCartItemResponse(CartItem cartItem);

    List<CartItemResponse> toCartItemResponseList(List<CartItem> items);
}
