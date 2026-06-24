package com.fooddelivery.service;

import com.fooddelivery.dto.response.CategoryResponse;
import java.util.List;

public interface CategoryService {
    CategoryResponse createCategory(Integer restaurantId, String categoryName, Integer ownerId);
    CategoryResponse updateCategory(Integer categoryId, String categoryName, Integer ownerId);
    List<CategoryResponse> getCategoriesByRestaurant(Integer restaurantId);
    void deleteCategory(Integer categoryId, Integer ownerId);
}