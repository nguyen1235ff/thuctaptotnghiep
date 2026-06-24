package com.fooddelivery.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOrderRequest {

    @NotBlank(message = "Địa chỉ giao hàng không được để trống")
    private String deliveryAddress;

    @NotBlank(message = "Số điện thoại giao hàng không được để trống")
    private String deliveryPhone;

    private String voucherCode;

    @Builder.Default
    private String paymentMethod = "COD";

    private String notes;
}