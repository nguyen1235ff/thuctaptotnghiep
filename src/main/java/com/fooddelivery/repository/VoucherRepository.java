package com.fooddelivery.repository;

import com.fooddelivery.entity.Voucher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Integer> {
    boolean existsByVoucherCode(String voucherCode);

    Optional<Voucher> findByVoucherCodeAndIsActiveTrue(String voucherCode);

    @Query("SELECT v FROM Voucher v WHERE v.voucherCode = :code AND v.isActive = true AND " +
            "v.startDate <= :currentTime AND v.endDate >= :currentTime AND " +
            "(v.maxUses IS NULL OR v.usedCount < v.maxUses)")
    Optional<Voucher> findValidVoucher(@Param("code") String code, @Param("currentTime") LocalDateTime currentTime);

    Page<Voucher> findByIsActiveTrue(Pageable pageable);
}