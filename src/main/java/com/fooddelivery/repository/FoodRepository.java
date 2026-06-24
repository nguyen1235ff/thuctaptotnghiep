package com.fooddelivery.repository;

import com.fooddelivery.entity.Food;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodRepository extends JpaRepository<Food, Integer> {
    Page<Food> findByRestaurantRestaurantIdAndIsAvailableTrue(Integer restaurantId, Pageable pageable);

    @Query("SELECT f FROM Food f WHERE f.category.categoryId = :categoryId AND f.isAvailable = true")
    Page<Food> findByCategoryIdAndIsAvailableTrue(@Param("categoryId") Integer categoryId, Pageable pageable);

    List<Food> findByCategoryCategoryIdAndIsAvailableTrue(Integer categoryId);

    @Query("SELECT f FROM Food f WHERE f.restaurant.restaurantId = :restaurantId AND f.isAvailable = true AND " +
            "LOWER(f.foodName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Food> searchByKeyword(@Param("restaurantId") Integer restaurantId,
                               @Param("keyword") String keyword, Pageable pageable);

    List<Food> findByRestaurantRestaurantId(Integer restaurantId);
}