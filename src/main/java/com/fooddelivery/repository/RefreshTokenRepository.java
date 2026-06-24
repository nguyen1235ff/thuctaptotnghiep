package com.fooddelivery.repository;

import com.fooddelivery.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Integer> {
    Optional<RefreshToken> findByTokenValue(String tokenValue);

    @Query("SELECT rt FROM RefreshToken rt WHERE rt.user.userId = :userId AND rt.expiresAt > CURRENT_TIMESTAMP")
    Optional<RefreshToken> findValidTokenByUserId(@Param("userId") Integer userId);

    void deleteByUserUserId(Integer userId);
}