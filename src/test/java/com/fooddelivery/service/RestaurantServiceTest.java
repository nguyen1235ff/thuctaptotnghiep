package com.fooddelivery.service;

import com.fooddelivery.dto.request.CreateRestaurantRequest;
import com.fooddelivery.dto.response.RestaurantResponse;
import com.fooddelivery.entity.Restaurant;
import com.fooddelivery.entity.User;
import com.fooddelivery.exception.ForbiddenException;
import com.fooddelivery.exception.ResourceNotFoundException;
import com.fooddelivery.mapper.RestaurantMapper;
import com.fooddelivery.repository.RestaurantRepository;
import com.fooddelivery.repository.UserRepository;
import com.fooddelivery.service.impl.RestaurantServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("RestaurantService Tests")
class RestaurantServiceTest {

    @Mock
    private RestaurantRepository restaurantRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RestaurantMapper restaurantMapper;

    @InjectMocks
    private RestaurantServiceImpl restaurantService;

    private CreateRestaurantRequest createRequest;
    private User owner;
    private Restaurant restaurant;
    private RestaurantResponse restaurantResponse;

    @BeforeEach
    void setUp() {
        createRequest = CreateRestaurantRequest.builder()
                .restaurantName("Pizza Palace")
                .description("Nhà hàng pizza")
                .address("123 Main St")
                .phone("0911111111")
                .email("pizza@example.com")
                .deliveryFee(BigDecimal.valueOf(15000))
                .minOrderValue(BigDecimal.valueOf(50000))
                .build();

        owner = User.builder()
                .userId(1)
                .username("owner")
                .email("owner@example.com")
                .fullName("Restaurant Owner")
                .build();

        restaurant = Restaurant.builder()
                .restaurantId(1)
                .restaurantName("Pizza Palace")
                .address("123 Main St")
                .phone("0911111111")
                .owner(owner)
                .deliveryFee(BigDecimal.valueOf(15000))
                .minOrderValue(BigDecimal.valueOf(50000))
                .isActive(true)
                .build();

        restaurantResponse = RestaurantResponse.builder()
                .restaurantId(1)
                .restaurantName("Pizza Palace")
                .address("123 Main St")
                .ownerName("Restaurant Owner")
                .build();
    }

    @Test
    @DisplayName("Should create restaurant successfully")
    void testCreateRestaurantSuccess() {
        // Arrange
        when(userRepository.findById(anyInt())).thenReturn(Optional.of(owner));
        when(restaurantRepository.save(any(Restaurant.class))).thenReturn(restaurant);
        when(restaurantMapper.toRestaurantResponse(any(Restaurant.class))).thenReturn(restaurantResponse);

        // Act
        RestaurantResponse result = restaurantService.createRestaurant(createRequest, owner.getUserId());

        // Assert
        assertNotNull(result);
        assertEquals("Pizza Palace", result.getRestaurantName());
        verify(restaurantRepository, times(1)).save(any(Restaurant.class));
    }

    @Test
    @DisplayName("Should throw exception when owner not found")
    void testCreateRestaurantWithInvalidOwner() {
        // Arrange
        when(userRepository.findById(anyInt())).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class,
                () -> restaurantService.createRestaurant(createRequest, 999));
    }

    @Test
    @DisplayName("Should get restaurant by id successfully")
    void testGetRestaurantByIdSuccess() {
        // Arrange
        when(restaurantRepository.findByRestaurantIdAndIsActiveTrue(anyInt()))
                .thenReturn(Optional.of(restaurant));
        when(restaurantMapper.toRestaurantResponse(any(Restaurant.class))).thenReturn(restaurantResponse);

        // Act
        RestaurantResponse result = restaurantService.getRestaurantById(1);

        // Assert
        assertNotNull(result);
        assertEquals("Pizza Palace", result.getRestaurantName());
    }

    @Test
    @DisplayName("Should throw exception when restaurant not found")
    void testGetRestaurantByIdNotFound() {
        // Arrange
        when(restaurantRepository.findByRestaurantIdAndIsActiveTrue(anyInt()))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> restaurantService.getRestaurantById(999));
    }

    @Test
    @DisplayName("Should delete restaurant successfully")
    void testDeleteRestaurantSuccess() {
        // Arrange
        when(restaurantRepository.findById(anyInt())).thenReturn(Optional.of(restaurant));
        when(restaurantRepository.save(any(Restaurant.class))).thenReturn(restaurant);

        // Act
        restaurantService.deleteRestaurant(1, owner.getUserId());

        // Assert
        verify(restaurantRepository, times(1)).save(any(Restaurant.class));
        assertFalse(restaurant.getIsActive());
    }

    @Test
    @DisplayName("Should throw exception when user is not owner")
    void testDeleteRestaurantUnauthorized() {
        // Arrange
        when(restaurantRepository.findById(anyInt())).thenReturn(Optional.of(restaurant));

        // Act & Assert
        assertThrows(ForbiddenException.class,
                () -> restaurantService.deleteRestaurant(1, 999));
    }

    @Test
    @DisplayName("Should get all restaurants with pagination")
    void testGetAllRestaurants() {
        // Arrange
        Page<Restaurant> restaurants = new PageImpl<>(Arrays.asList(restaurant));
        Pageable pageable = PageRequest.of(0, 10);

        when(restaurantRepository.findByIsActiveTrue(pageable)).thenReturn(restaurants);
        when(restaurantMapper.toRestaurantResponse(any(Restaurant.class))).thenReturn(restaurantResponse);

        // Act
        Page<RestaurantResponse> result = restaurantService.getAllRestaurants(pageable);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(restaurantRepository, times(1)).findByIsActiveTrue(pageable);
    }
}