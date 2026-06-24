package com.fooddelivery.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemResponse {

    private Integer orderItemId;
    private String foodName;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
}