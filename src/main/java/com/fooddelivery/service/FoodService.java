package com.fooddelivery.service;

import com.fooddelivery.dto.request.CreateFoodRequest;
import com.fooddelivery.dto.response.FoodResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface FoodService {
    FoodResponse createFood(Integer restaurantId, CreateFoodRequest request, Integer ownerId);
    FoodResponse updateFood(Integer foodId, CreateFoodRequest request, Integer ownerId);
    FoodResponse getFoodById(Integer foodId);
    Page<FoodResponse> getFoodsByRestaurant(Integer restaurantId, Pageable pageable);
    Page<FoodResponse> searchFoods(Integer restaurantId, String keyword, Pageable pageable);
    Page<FoodResponse> getFoodsByCategory(Integer categoryId, Pageable pageable);
    void deleteFood(Integer foodId, Integer ownerId);
}