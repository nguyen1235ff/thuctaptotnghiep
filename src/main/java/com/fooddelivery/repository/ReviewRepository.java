package com.fooddelivery.repository;

import com.fooddelivery.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {
    Page<Review> findByRestaurantRestaurantId(Integer restaurantId, Pageable pageable);

    Optional<Review> findByOrderOrderId(Integer orderId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.restaurant.restaurantId = :restaurantId")
    Double getAverageRatingByRestaurant(@Param("restaurantId") Integer restaurantId);
}