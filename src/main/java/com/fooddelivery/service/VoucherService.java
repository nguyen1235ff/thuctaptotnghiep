package com.fooddelivery.service;

import com.fooddelivery.dto.request.VoucherRequest;
import com.fooddelivery.dto.response.VoucherResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface VoucherService {
    VoucherResponse getVoucherByCode(String code);
    Page<VoucherResponse> getAllVouchers(Pageable pageable);
    Page<VoucherResponse> getAllVouchersAdmin(Pageable pageable);
    VoucherResponse createVoucher(VoucherRequest request);
    VoucherResponse updateVoucher(Integer voucherId, VoucherRequest request);
    void deleteVoucher(Integer voucherId);
}