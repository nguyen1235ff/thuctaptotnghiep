package com.fooddelivery.repository;

import com.fooddelivery.entity.Restaurant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Integer> {
    Page<Restaurant> findByIsActiveTrue(Pageable pageable);

    @Query("SELECT r FROM Restaurant r WHERE r.isActive = true AND " +
            "(LOWER(r.restaurantName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(r.address) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Restaurant> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    Page<Restaurant> findByOwnerUserId(Integer ownerId, Pageable pageable);
    Optional<Restaurant> findByRestaurantIdAndIsActiveTrue(Integer restaurantId);
}