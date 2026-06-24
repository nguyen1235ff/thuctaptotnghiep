package com.fooddelivery.service.impl;

import com.fooddelivery.dto.request.VoucherRequest;
import com.fooddelivery.dto.response.VoucherResponse;
import com.fooddelivery.entity.Voucher;
import com.fooddelivery.exception.BadRequestException;
import com.fooddelivery.exception.DuplicateResourceException;
import com.fooddelivery.exception.ResourceNotFoundException;
import com.fooddelivery.mapper.VoucherMapper;
import com.fooddelivery.repository.VoucherRepository;
import com.fooddelivery.service.VoucherService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Service
@AllArgsConstructor
@Slf4j
@Transactional
public class VoucherServiceImpl implements VoucherService {

    private static final Set<String> VALID_DISCOUNT_TYPES = Set.of("PERCENTAGE", "FIXED_AMOUNT");

    private final VoucherRepository voucherRepository;
    private final VoucherMapper voucherMapper;

    @Override
    @Transactional(readOnly = true)
    public VoucherResponse getVoucherByCode(String code) {
        log.info("Lấy voucher với mã: {}", code);

        Voucher voucher = voucherRepository.findValidVoucher(code, LocalDateTime.now())
                .orElseThrow(() -> new ResourceNotFoundException("Voucher", "code", code));

        return voucherMapper.toVoucherResponse(voucher);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<VoucherResponse> getAllVouchers(Pageable pageable) {
        log.info("Lấy danh sách voucher");

        Page<Voucher> vouchers = voucherRepository.findByIsActiveTrue(pageable);
        return vouchers.map(voucherMapper::toVoucherResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<VoucherResponse> getAllVouchersAdmin(Pageable pageable) {
        return voucherRepository.findAll(pageable).map(voucherMapper::toVoucherResponse);
    }

    @Override
    public VoucherResponse createVoucher(VoucherRequest request) {
        validateVoucherRequest(request);

        if (voucherRepository.existsByVoucherCode(request.getVoucherCode())) {
            throw new DuplicateResourceException("Voucher", "code", request.getVoucherCode());
        }

        Voucher voucher = Voucher.builder()
                .voucherCode(request.getVoucherCode().toUpperCase())
                .description(request.getDescription())
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .minOrderValue(request.getMinOrderValue() != null ? request.getMinOrderValue() : BigDecimal.ZERO)
                .maxUses(request.getMaxUses())
                .usedCount(0)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        Voucher saved = voucherRepository.save(voucher);
        log.info("Tạo voucher thành công: {}", saved.getVoucherCode());
        return voucherMapper.toVoucherResponse(saved);
    }

    @Override
    public VoucherResponse updateVoucher(Integer voucherId, VoucherRequest request) {
        validateVoucherRequest(request);

        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher", "id", voucherId));

        if (!voucher.getVoucherCode().equalsIgnoreCase(request.getVoucherCode())
                && voucherRepository.existsByVoucherCode(request.getVoucherCode())) {
            throw new DuplicateResourceException("Voucher", "code", request.getVoucherCode());
        }

        voucher.setVoucherCode(request.getVoucherCode().toUpperCase());
        voucher.setDescription(request.getDescription());
        voucher.setDiscountType(request.getDiscountType());
        voucher.setDiscountValue(request.getDiscountValue());
        voucher.setMinOrderValue(request.getMinOrderValue() != null ? request.getMinOrderValue() : BigDecimal.ZERO);
        voucher.setMaxUses(request.getMaxUses());
        voucher.setStartDate(request.getStartDate());
        voucher.setEndDate(request.getEndDate());
        if (request.getIsActive() != null) {
            voucher.setIsActive(request.getIsActive());
        }

        Voucher updated = voucherRepository.save(voucher);
        log.info("Cập nhật voucher thành công: {}", updated.getVoucherId());
        return voucherMapper.toVoucherResponse(updated);
    }

    @Override
    public void deleteVoucher(Integer voucherId) {
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher", "id", voucherId));

        voucher.setIsActive(false);
        voucherRepository.save(voucher);
        log.info("Vô hiệu hóa voucher: {}", voucherId);
    }

    private void validateVoucherRequest(VoucherRequest request) {
        if (!VALID_DISCOUNT_TYPES.contains(request.getDiscountType())) {
            throw new BadRequestException("Loại giảm giá phải là PERCENTAGE hoặc FIXED_AMOUNT");
        }

        if ("PERCENTAGE".equals(request.getDiscountType())
                && request.getDiscountValue().compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new BadRequestException("Giảm giá phần trăm không được vượt quá 100%");
        }

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("Ngày kết thúc phải sau ngày bắt đầu");
        }
    }
}
