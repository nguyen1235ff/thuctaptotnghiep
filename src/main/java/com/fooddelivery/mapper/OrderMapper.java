package com.fooddelivery.mapper;

import com.fooddelivery.dto.response.OrderItemResponse;
import com.fooddelivery.dto.response.OrderResponse;
import com.fooddelivery.dto.response.OrderStatusHistoryResponse;
import com.fooddelivery.entity.Order;
import com.fooddelivery.entity.OrderItem;
import com.fooddelivery.entity.OrderStatusHistory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mapping(target = "restaurantName", source = "restaurant.restaurantName")
    @Mapping(target = "items", source = "items")
    @Mapping(target = "statusHistory", source = "statusHistory")
    OrderResponse toOrderResponse(Order order);

    OrderItemResponse toOrderItemResponse(OrderItem orderItem);

    @Mapping(target = "changedBy", source = "changedBy.fullName")
    OrderStatusHistoryResponse toOrderStatusHistoryResponse(OrderStatusHistory history);

    List<OrderItemResponse> toOrderItemResponseList(List<OrderItem> items);

    List<OrderStatusHistoryResponse> toOrderStatusHistoryResponseList(List<OrderStatusHistory> histories);
}
