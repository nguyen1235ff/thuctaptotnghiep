package com.fooddelivery.service.impl;

import com.fooddelivery.dto.response.CategoryResponse;
import com.fooddelivery.entity.Category;
import com.fooddelivery.entity.Restaurant;
import com.fooddelivery.exception.ForbiddenException;
import com.fooddelivery.exception.ResourceNotFoundException;
import com.fooddelivery.mapper.CategoryMapper;
import com.fooddelivery.repository.CategoryRepository;
import com.fooddelivery.repository.RestaurantRepository;
import com.fooddelivery.service.CategoryService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Slf4j
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final RestaurantRepository restaurantRepository;
    private final CategoryMapper categoryMapper;

    @Override
    public CategoryResponse createCategory(Integer restaurantId, String categoryName, Integer ownerId) {
        log.info("Tạo danh mục mới cho nhà hàng: {}", restaurantId);

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Nhà hàng", "id", restaurantId));

        if (!restaurant.getOwner().getUserId().equals(ownerId)) {
            throw new ForbiddenException("Bạn không có quyền tạo danh mục cho nhà hàng này");
        }

        Category category = Category.builder()
                .categoryName(categoryName)
                .restaurant(restaurant)
                .displayOrder(0)
                .build();

        Category savedCategory = categoryRepository.save(category);
        log.info("Tạo danh mục thành công với ID: {}", savedCategory.getCategoryId());

        return categoryMapper.toCategoryResponse(savedCategory);
    }

    @Override
    public CategoryResponse updateCategory(Integer categoryId, String categoryName, Integer ownerId) {
        log.info("Cập nhật danh mục: {}", categoryId);

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục", "id", categoryId));

        if (!category.getRestaurant().getOwner().getUserId().equals(ownerId)) {
            throw new ForbiddenException("Bạn không có quyền cập nhật danh mục này");
        }

        category.setCategoryName(categoryName);
        Category updatedCategory = categoryRepository.save(category);

        log.info("Cập nhật danh mục thành công: {}", categoryId);

        return categoryMapper.toCategoryResponse(updatedCategory);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategoriesByRestaurant(Integer restaurantId) {
        log.info("Lấy danh sách danh mục của nhà hàng: {}", restaurantId);

        restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Nhà hàng", "id", restaurantId));

        List<Category> categories = categoryRepository.findByRestaurantRestaurantIdOrderByDisplayOrder(restaurantId);

        return categories.stream()
                .map(categoryMapper::toCategoryResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteCategory(Integer categoryId, Integer ownerId) {
        log.info("Xóa danh mục: {}", categoryId);

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục", "id", categoryId));

        if (!category.getRestaurant().getOwner().getUserId().equals(ownerId)) {
            throw new ForbiddenException("Bạn không có quyền xóa danh mục này");
        }

        categoryRepository.delete(category);

        log.info("Xóa danh mục thành công: {}", categoryId);
    }
}