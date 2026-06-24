package com.fooddelivery.service.impl;

import com.fooddelivery.dto.request.CreateFoodRequest;
import com.fooddelivery.dto.response.FoodResponse;
import com.fooddelivery.entity.Category;
import com.fooddelivery.entity.Food;
import com.fooddelivery.entity.Restaurant;
import com.fooddelivery.exception.ForbiddenException;
import com.fooddelivery.exception.ResourceNotFoundException;
import com.fooddelivery.mapper.FoodMapper;
import com.fooddelivery.repository.CategoryRepository;
import com.fooddelivery.repository.FoodRepository;
import com.fooddelivery.repository.RestaurantRepository;
import com.fooddelivery.service.FoodService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
@Slf4j
@Transactional
public class FoodServiceImpl implements FoodService {

    private final FoodRepository foodRepository;
    private final CategoryRepository categoryRepository;
    private final RestaurantRepository restaurantRepository;
    private final FoodMapper foodMapper;

    @Override
    public FoodResponse createFood(Integer restaurantId, CreateFoodRequest request, Integer ownerId) {
        log.info("Tạo món ăn mới cho nhà hàng: {}", restaurantId);

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Nhà hàng", "id", restaurantId));

        if (!restaurant.getOwner().getUserId().equals(ownerId)) {
            throw new ForbiddenException("Bạn không có quyền tạo món ăn cho nhà hàng này");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục", "id", request.getCategoryId()));

        Food food = Food.builder()
                .foodName(request.getFoodName())
                .description(request.getDescription())
                .price(request.getPrice())
                .imageUrl(request.getImageUrl())
                .category(category)
                .restaurant(restaurant)
                .isAvailable(true)
                .build();

        Food savedFood = foodRepository.save(food);
        log.info("Tạo món ăn thành công với ID: {}", savedFood.getFoodId());

        return foodMapper.toFoodResponse(savedFood);
    }

    @Override
    public FoodResponse updateFood(Integer foodId, CreateFoodRequest request, Integer ownerId) {
        log.info("Cập nhật món ăn: {}", foodId);

        Food food = foodRepository.findById(foodId)
                .orElseThrow(() -> new ResourceNotFoundException("Món ăn", "id", foodId));

        if (!food.getRestaurant().getOwner().getUserId().equals(ownerId)) {
            throw new ForbiddenException("Bạn không có quyền cập nhật món ăn này");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục", "id", request.getCategoryId()));

        food.setFoodName(request.getFoodName());
        food.setDescription(request.getDescription());
        food.setPrice(request.getPrice());
        food.setImageUrl(request.getImageUrl());
        food.setCategory(category);

        Food updatedFood = foodRepository.save(food);
        log.info("Cập nhật món ăn thành công: {}", foodId);

        return foodMapper.toFoodResponse(updatedFood);
    }

    @Override
    @Transactional(readOnly = true)
    public FoodResponse getFoodById(Integer foodId) {
        Food food = foodRepository.findById(foodId)
                .orElseThrow(() -> new ResourceNotFoundException("Món ăn", "id", foodId));

        return foodMapper.toFoodResponse(food);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<FoodResponse> getFoodsByRestaurant(Integer restaurantId, Pageable pageable) {
        log.info("Lấy danh sách món ăn của nhà hàng: {}", restaurantId);

        restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Nhà hàng", "id", restaurantId));

        Page<Food> foods = foodRepository.findByRestaurantRestaurantIdAndIsAvailableTrue(restaurantId, pageable);
        return foods.map(foodMapper::toFoodResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<FoodResponse> searchFoods(Integer restaurantId, String keyword, Pageable pageable) {
        log.info("Tìm kiếm món ăn trong nhà hàng: {} với keyword: {}", restaurantId, keyword);

        Page<Food> foods = foodRepository.searchByKeyword(restaurantId, keyword, pageable);
        return foods.map(foodMapper::toFoodResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<FoodResponse> getFoodsByCategory(Integer categoryId, Pageable pageable) {
        log.info("Lấy danh sách món ăn theo danh mục: {}", categoryId);

        categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục", "id", categoryId));

        Page<Food> foods = foodRepository.findByCategoryIdAndIsAvailableTrue(categoryId, pageable);
        return foods.map(foodMapper::toFoodResponse);
    }

    @Override
    public void deleteFood(Integer foodId, Integer ownerId) {
        log.info("Xóa món ăn: {}", foodId);

        Food food = foodRepository.findById(foodId)
                .orElseThrow(() -> new ResourceNotFoundException("Món ăn", "id", foodId));

        if (!food.getRestaurant().getOwner().getUserId().equals(ownerId)) {
            throw new ForbiddenException("Bạn không có quyền xóa món ăn này");
        }

        food.setIsAvailable(false);
        foodRepository.save(food);

        log.info("Xóa món ăn thành công: {}", foodId);
    }
}