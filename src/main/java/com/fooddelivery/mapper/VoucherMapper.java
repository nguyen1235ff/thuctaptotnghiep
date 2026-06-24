package com.fooddelivery.mapper;

import com.fooddelivery.dto.response.VoucherResponse;
import com.fooddelivery.entity.Voucher;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface VoucherMapper {

    VoucherResponse toVoucherResponse(Voucher voucher);
}
