package com.fooddelivery.repository;

import com.fooddelivery.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Integer> {
    Optional<CartItem> findByCartCartIdAndFoodFoodId(Integer cartId, Integer foodId);
    void deleteByCartCartIdAndFoodFoodId(Integer cartId, Integer foodId);
}