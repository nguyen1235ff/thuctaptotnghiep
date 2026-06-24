package com.fooddelivery.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateRestaurantRequest {

    @NotBlank(message = "Tên nhà hàng không được để trống")
    private String restaurantName;

    private String description;

    @NotBlank(message = "Địa chỉ không được để trống")
    private String address;

    @NotBlank(message = "Số điện thoại không được để trống")
    private String phone;

    private String email;

    @NotNull(message = "Phí giao hàng không được để trống")
    @DecimalMin(value = "0", message = "Phí giao hàng không được âm")
    private BigDecimal deliveryFee;

    @NotNull(message = "Đơn hàng tối thiểu không được để trống")
    @DecimalMin(value = "0", message = "Đơn hàng tối thiểu không được âm")
    private BigDecimal minOrderValue;

    private String imageUrl;
}