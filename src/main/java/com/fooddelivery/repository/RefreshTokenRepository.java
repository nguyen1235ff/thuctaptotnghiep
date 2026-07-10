package com.fooddelivery.repository;

import com.fooddelivery.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Integer> {

    Optional<RefreshToken> findByTokenValue(String tokenValue);

    /**
     * Tìm token hợp lệ (chưa hết hạn) của user.
     * Dùng :now thay vì CURRENT_TIMESTAMP để tránh lỗi SQL Server trong JPQL.
     */
    @Query("SELECT rt FROM RefreshToken rt WHERE rt.user.userId = :userId AND rt.expiresAt > :now")
    Optional<RefreshToken> findValidTokenByUserId(@Param("userId") Integer userId,
                                                   @Param("now") LocalDateTime now);

    @Modifying
    @Transactional
    void deleteByUserUserId(Integer userId);

    /**
     * Xóa các refresh token đã hết hạn (cleanup job).
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiresAt < :now")
    void deleteExpiredTokens(@Param("now") LocalDateTime now);
}