package com.fooddelivery.repository;

import com.fooddelivery.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    Optional<Order> findByOrderCode(String orderCode);

    Page<Order> findByCustomerUserIdOrderByCreatedAtDesc(Integer userId, Pageable pageable);

    Page<Order> findByRestaurantRestaurantIdOrderByCreatedAtDesc(Integer restaurantId, Pageable pageable);

    Page<Order> findByShipperUserIdAndOrderStatusOrderByCreatedAtDesc(Integer shipperId, String status, Pageable pageable);

    Page<Order> findByOrderStatusAndShipperIsNullOrderByCreatedAtDesc(String status, Pageable pageable);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.orderStatus = :status AND o.createdAt >= :startDate")
    Long countByStatusAndDate(@Param("status") String status, @Param("startDate") LocalDateTime startDate);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.orderStatus = 'COMPLETED' AND o.createdAt >= :startDate")
    java.math.BigDecimal getTotalRevenueByDate(@Param("startDate") LocalDateTime startDate);
}