package com.fooddelivery.service;

import com.fooddelivery.dto.request.AddToCartRequest;
import com.fooddelivery.dto.response.CartResponse;

public interface CartService {
    CartResponse getCart(Integer userId);
    CartResponse addItemToCart(Integer userId, AddToCartRequest request);
    CartResponse updateCartItem(Integer userId, Integer cartItemId, Integer quantity);
    CartResponse removeItemFromCart(Integer userId, Integer cartItemId);
    CartResponse clearCart(Integer userId);
}