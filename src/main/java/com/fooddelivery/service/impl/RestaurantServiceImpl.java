package com.fooddelivery.service.impl;

import com.fooddelivery.dto.request.CreateRestaurantRequest;
import com.fooddelivery.dto.response.RestaurantResponse;
import com.fooddelivery.entity.Restaurant;
import com.fooddelivery.entity.User;
import com.fooddelivery.exception.ForbiddenException;
import com.fooddelivery.exception.ResourceNotFoundException;
import com.fooddelivery.mapper.RestaurantMapper;
import com.fooddelivery.repository.RestaurantRepository;
import com.fooddelivery.repository.UserRepository;
import com.fooddelivery.service.RestaurantService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@AllArgsConstructor
@Slf4j
@Transactional
public class RestaurantServiceImpl implements RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;
    private final RestaurantMapper restaurantMapper;

    @Override
    public RestaurantResponse createRestaurant(CreateRestaurantRequest request, Integer ownerId) {
        log.info("Tạo nhà hàng mới cho chủ: {}", ownerId);

        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", "id", ownerId));

        Restaurant restaurant = Restaurant.builder()
                .restaurantName(request.getRestaurantName())
                .description(request.getDescription())
                .address(request.getAddress())
                .phone(request.getPhone())
                .email(request.getEmail())
                .owner(owner)
                .deliveryFee(request.getDeliveryFee() != null ? request.getDeliveryFee() : BigDecimal.ZERO)
                .minOrderValue(request.getMinOrderValue() != null ? request.getMinOrderValue() : BigDecimal.ZERO)
                .imageUrl(request.getImageUrl())
                .isActive(true)
                .build();

        Restaurant savedRestaurant = restaurantRepository.save(restaurant);
        log.info("Tạo nhà hàng thành công với ID: {}", savedRestaurant.getRestaurantId());

        return restaurantMapper.toRestaurantResponse(savedRestaurant);
    }

    @Override
    public RestaurantResponse updateRestaurant(Integer restaurantId, CreateRestaurantRequest request, Integer ownerId) {
        log.info("Cập nhật nhà hàng: {} cho chủ: {}", restaurantId, ownerId);

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Nhà hàng", "id", restaurantId));

        if (!restaurant.getOwner().getUserId().equals(ownerId)) {
            throw new ForbiddenException("Bạn không có quyền cập nhật nhà hàng này");
        }

        restaurant.setRestaurantName(request.getRestaurantName());
        restaurant.setDescription(request.getDescription());
        restaurant.setAddress(request.getAddress());
        restaurant.setPhone(request.getPhone());
        restaurant.setEmail(request.getEmail());
        restaurant.setDeliveryFee(request.getDeliveryFee());
        restaurant.setMinOrderValue(request.getMinOrderValue());
        restaurant.setImageUrl(request.getImageUrl());

        Restaurant updatedRestaurant = restaurantRepository.save(restaurant);
        log.info("Cập nhật nhà hàng thành công: {}", restaurantId);

        return restaurantMapper.toRestaurantResponse(updatedRestaurant);
    }

    @Override
    @Transactional(readOnly = true)
    public RestaurantResponse getRestaurantById(Integer restaurantId) {
        Restaurant restaurant = restaurantRepository.findByRestaurantIdAndIsActiveTrue(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Nhà hàng", "id", restaurantId));

        return restaurantMapper.toRestaurantResponse(restaurant);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RestaurantResponse> getAllRestaurants(Pageable pageable) {
        log.info("Lấy danh sách nhà hàng");

        Page<Restaurant> restaurants = restaurantRepository.findByIsActiveTrue(pageable);
        return restaurants.map(restaurantMapper::toRestaurantResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RestaurantResponse> searchRestaurants(String keyword, Pageable pageable) {
        log.info("Tìm kiếm nhà hàng với keyword: {}", keyword);

        Page<Restaurant> restaurants = restaurantRepository.searchByKeyword(keyword, pageable);
        return restaurants.map(restaurantMapper::toRestaurantResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RestaurantResponse> getMyRestaurants(Integer ownerId, Pageable pageable) {
        log.info("Lấy danh sách nhà hàng của chủ: {}", ownerId);

        Page<Restaurant> restaurants = restaurantRepository.findByOwnerUserId(ownerId, pageable);
        return restaurants.map(restaurantMapper::toRestaurantResponse);
    }

    @Override
    public void deleteRestaurant(Integer restaurantId, Integer ownerId) {
        log.info("Xóa nhà hàng: {} của chủ: {}", restaurantId, ownerId);

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Nhà hàng", "id", restaurantId));

        if (!restaurant.getOwner().getUserId().equals(ownerId)) {
            throw new ForbiddenException("Bạn không có quyền xóa nhà hàng này");
        }

        restaurant.setIsActive(false);
        restaurantRepository.save(restaurant);

        log.info("Xóa nhà hàng thành công: {}", restaurantId);
    }
}