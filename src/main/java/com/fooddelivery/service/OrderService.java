package com.fooddelivery.service;

import com.fooddelivery.dto.request.CreateOrderRequest;
import com.fooddelivery.dto.response.OrderResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderService {
    OrderResponse createOrder(Integer userId, CreateOrderRequest request);
    OrderResponse getOrderById(Integer orderId, Integer userId);
    OrderResponse getOrderByCode(String orderCode);
    Page<OrderResponse> getMyOrders(Integer userId, Pageable pageable);
    Page<OrderResponse> getRestaurantOrders(Integer restaurantId, Integer ownerId, Pageable pageable);
    Page<OrderResponse> getShipperOrders(Integer shipperId, String status, Pageable pageable);
    OrderResponse updateOrderStatus(Integer orderId, String newStatus, Integer userId);
    OrderResponse cancelOrder(Integer orderId, Integer userId);
    void acceptOrder(Integer orderId, Integer shipperId);
}