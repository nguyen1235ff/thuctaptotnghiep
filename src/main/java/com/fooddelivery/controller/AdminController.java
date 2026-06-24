package com.fooddelivery.controller;

import com.fooddelivery.dto.request.VoucherRequest;
import com.fooddelivery.dto.response.UserResponse;
import com.fooddelivery.dto.response.VoucherResponse;
import com.fooddelivery.service.UserService;
import com.fooddelivery.service.VoucherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@AllArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "API quản trị hệ thống")
public class AdminController {

    private final UserService userService;
    private final VoucherService voucherService;

    @GetMapping("/users")
    @Operation(summary = "Danh sách người dùng")
    public ResponseEntity<Page<UserResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(userService.getAllUsers(pageable));
    }

    @PutMapping("/users/{id}/active")
    @Operation(summary = "Kích hoạt/vô hiệu hóa người dùng")
    public ResponseEntity<UserResponse> toggleUserActive(
            @PathVariable Integer id,
            @RequestParam boolean active) {
        return ResponseEntity.ok(userService.toggleUserActive(id, active));
    }

    @GetMapping("/vouchers")
    @Operation(summary = "Danh sách voucher (admin)")
    public ResponseEntity<Page<VoucherResponse>> getAllVouchersAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(voucherService.getAllVouchersAdmin(pageable));
    }

    @PostMapping("/vouchers")
    @Operation(summary = "Tạo voucher mới")
    public ResponseEntity<VoucherResponse> createVoucher(@Valid @RequestBody VoucherRequest request) {
        VoucherResponse response = voucherService.createVoucher(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/vouchers/{id}")
    @Operation(summary = "Cập nhật voucher")
    public ResponseEntity<VoucherResponse> updateVoucher(
            @PathVariable Integer id,
            @Valid @RequestBody VoucherRequest request) {
        return ResponseEntity.ok(voucherService.updateVoucher(id, request));
    }

    @DeleteMapping("/vouchers/{id}")
    @Operation(summary = "Xóa voucher (soft delete)")
    public ResponseEntity<Void> deleteVoucher(@PathVariable Integer id) {
        voucherService.deleteVoucher(id);
        return ResponseEntity.noContent().build();
    }
}
