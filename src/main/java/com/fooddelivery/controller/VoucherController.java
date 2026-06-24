package com.fooddelivery.controller;

import com.fooddelivery.dto.response.VoucherResponse;
import com.fooddelivery.service.VoucherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/vouchers")
@AllArgsConstructor
@Tag(name = "Voucher", description = "API quản lý voucher")
public class VoucherController {

    private final VoucherService voucherService;

    @GetMapping
    @Operation(summary = "Lấy danh sách voucher", description = "Lấy danh sách voucher khả dụng")
    public ResponseEntity<Page<VoucherResponse>> getAllVouchers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<VoucherResponse> vouchers = voucherService.getAllVouchers(pageable);
        return ResponseEntity.ok(vouchers);
    }

    @GetMapping("/{code}")
    @Operation(summary = "Lấy voucher theo mã", description = "Lấy thông tin voucher bằng mã voucher")
    public ResponseEntity<VoucherResponse> getVoucherByCode(
            @Parameter(description = "Mã voucher")
            @PathVariable String code) {

        VoucherResponse voucher = voucherService.getVoucherByCode(code);
        return ResponseEntity.ok(voucher);
    }
}