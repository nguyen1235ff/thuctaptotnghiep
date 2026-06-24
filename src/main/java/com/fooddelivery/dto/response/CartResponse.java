package com.fooddelivery.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartResponse {

    private Integer cartId;
    private Integer restaurantId;
    private String restaurantName;
    private Integer totalItems;
    private BigDecimal subtotal;
    private List<CartItemResponse> items;
}