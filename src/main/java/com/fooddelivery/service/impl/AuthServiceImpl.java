package com.fooddelivery.service.impl;

import com.fooddelivery.dto.request.ForgotPasswordRequest;
import com.fooddelivery.dto.request.LoginRequest;
import com.fooddelivery.dto.request.RefreshTokenRequest;
import com.fooddelivery.dto.request.RegisterRequest;
import com.fooddelivery.dto.request.ResetPasswordRequest;
import com.fooddelivery.dto.response.AuthResponse;
import com.fooddelivery.dto.response.UserResponse;
import com.fooddelivery.entity.PasswordResetToken;
import com.fooddelivery.entity.RefreshToken;
import com.fooddelivery.entity.Role;
import com.fooddelivery.entity.User;
import com.fooddelivery.exception.BadRequestException;
import com.fooddelivery.exception.DuplicateResourceException;
import com.fooddelivery.exception.ResourceNotFoundException;
import com.fooddelivery.exception.UnauthorizedException;
import com.fooddelivery.mapper.UserMapper;
import com.fooddelivery.repository.PasswordResetTokenRepository;
import com.fooddelivery.repository.RefreshTokenRepository;
import com.fooddelivery.repository.RoleRepository;
import com.fooddelivery.repository.UserRepository;
import com.fooddelivery.security.JwtTokenProvider;
import com.fooddelivery.service.AuthService;
import com.fooddelivery.service.EmailService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import static java.util.Set.of;

@Service
@AllArgsConstructor
@Slf4j
@Transactional
public class AuthServiceImpl implements AuthService {

    private static final Set<String> ALLOWED_REGISTER_ROLES = of("CUSTOMER", "RESTAURANT", "SHIPPER");

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserMapper userMapper;
    private final EmailService emailService;

    @Override
    public UserResponse register(RegisterRequest request) {
        log.info("Đang đăng ký người dùng: {}", request.getUsername());

        // Check username exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Người dùng", "username", request.getUsername());
        }

        // Check email exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Người dùng", "email", request.getEmail());
        }

        if (!ALLOWED_REGISTER_ROLES.contains(request.getRoleName())) {
            throw new BadRequestException("Role không hợp lệ. Chỉ được đăng ký: CUSTOMER, RESTAURANT, SHIPPER");
        }

        Role role = roleRepository.findByRoleName(request.getRoleName())
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", request.getRoleName()));

        // Create new user
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .address(request.getAddress())
                .isActive(true)
                .roles(new HashSet<>(Set.of(role)))
                .build();

        User savedUser = userRepository.save(user);
        log.info("Đăng ký thành công người dùng: {}", savedUser.getUserId());

        return userMapper.toUserResponse(savedUser);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        log.info("Đang đăng nhập người dùng: {}", request.getUsername());

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );

            String accessToken = tokenProvider.generateAccessToken(authentication);

            User user = userRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> new ResourceNotFoundException("Người dùng", "username", request.getUsername()));

            String refreshToken = tokenProvider.generateRefreshToken(user.getUserId());

            // Save refresh token
            RefreshToken refreshTokenEntity = RefreshToken.builder()
                    .user(user)
                    .tokenValue(refreshToken)
                    .expiresAt(LocalDateTime.now().plusDays(7))
                    .build();

            refreshTokenRepository.save(refreshTokenEntity);

            log.info("Đăng nhập thành công người dùng: {}", user.getUserId());

            return AuthResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .expiresIn(3600L)
                    .user(userMapper.toUserResponse(user))
                    .build();

        } catch (Exception ex) {
            log.error("Lỗi đăng nhập: {}", ex.getMessage());
            throw new UnauthorizedException("Username hoặc password không đúng");
        }
    }

    @Override
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        log.info("Đang refresh token");

        if (!tokenProvider.validateToken(request.getRefreshToken())) {
            throw new UnauthorizedException("Refresh token không hợp lệ hoặc đã hết hạn");
        }

        Integer userId = tokenProvider.getUserIdFromToken(request.getRefreshToken());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", "id", userId));

        RefreshToken refreshTokenEntity = refreshTokenRepository.findByTokenValue(request.getRefreshToken())
                .orElseThrow(() -> new UnauthorizedException("Refresh token không tìm thấy"));

        if (refreshTokenEntity.getExpiresAt().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(refreshTokenEntity);
            throw new UnauthorizedException("Refresh token đã hết hạn");
        }

        // Generate new access token
        java.util.List<String> roles = user.getRoles().stream()
                .map(Role::getRoleName)
                .toList();

        String newAccessToken = tokenProvider.generateAccessTokenByUserId(
                user.getUserId(),
                user.getUsername(),
                roles
        );

        // Generate new refresh token
        String newRefreshToken = tokenProvider.generateRefreshToken(user.getUserId());

        // Delete old refresh token and save new one
        refreshTokenRepository.delete(refreshTokenEntity);

        RefreshToken newRefreshTokenEntity = RefreshToken.builder()
                .user(user)
                .tokenValue(newRefreshToken)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();

        refreshTokenRepository.save(newRefreshTokenEntity);

        log.info("Refresh token thành công cho người dùng: {}", userId);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .expiresIn(3600L)
                .user(userMapper.toUserResponse(user))
                .build();
    }

    @Override
    public void logout(Integer userId) {
        log.info("Đang logout người dùng: {}", userId);

        refreshTokenRepository.deleteByUserUserId(userId);

        log.info("Logout thành công người dùng: {}", userId);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", "id", userId));
        return userMapper.toUserResponse(user);
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        log.info("Yêu cầu quên mật khẩu cho email: {}", request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", "email", request.getEmail()));

        // Xóa token cũ nếu có
        passwordResetTokenRepository.deleteByUserUserId(user.getUserId());

        // Tạo token mới
        String token = UUID.randomUUID().toString().replace("-", "");

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiresAt(LocalDateTime.now().plusMinutes(15))
                .used(false)
                .build();

        passwordResetTokenRepository.save(resetToken);

        // Gửi email
        emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), token);

        log.info("Đã gửi email đặt lại mật khẩu cho user: {}", user.getUserId());
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        log.info("Đặt lại mật khẩu với token");

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Mật khẩu xác nhận không khớp");
        }

        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new BadRequestException("Token không hợp lệ hoặc đã hết hạn"));

        if (resetToken.getUsed()) {
            throw new BadRequestException("Token đã được sử dụng");
        }

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            passwordResetTokenRepository.delete(resetToken);
            throw new BadRequestException("Token đã hết hạn. Vui lòng yêu cầu lại");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Đánh dấu token đã dùng
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        // Xóa tất cả refresh token để buộc đăng nhập lại
        refreshTokenRepository.deleteByUserUserId(user.getUserId());

        log.info("Đặt lại mật khẩu thành công cho user: {}", user.getUserId());
    }
}