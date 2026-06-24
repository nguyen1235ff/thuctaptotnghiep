package com.fooddelivery.repository;

import com.fooddelivery.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {
    List<Category> findByRestaurantRestaurantIdOrderByDisplayOrder(Integer restaurantId);

    @Query("SELECT c FROM Category c WHERE c.restaurant.restaurantId = :restaurantId ORDER BY c.displayOrder")
    List<Category> findByRestaurantIdWithOrder(@Param("restaurantId") Integer restaurantId);
}