package com.fooddelivery.service;

import com.fooddelivery.dto.request.CreateRestaurantRequest;
import com.fooddelivery.dto.response.RestaurantResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface RestaurantService {
    RestaurantResponse createRestaurant(CreateRestaurantRequest request, Integer ownerId);
    RestaurantResponse updateRestaurant(Integer restaurantId, CreateRestaurantRequest request, Integer ownerId);
    RestaurantResponse getRestaurantById(Integer restaurantId);
    Page<RestaurantResponse> getAllRestaurants(Pageable pageable);
    Page<RestaurantResponse> searchRestaurants(String keyword, Pageable pageable);
    Page<RestaurantResponse> getMyRestaurants(Integer ownerId, Pageable pageable);
    void deleteRestaurant(Integer restaurantId, Integer ownerId);
}