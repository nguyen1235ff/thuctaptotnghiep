package com.fooddelivery.service;

import com.fooddelivery.dto.request.AddToCartRequest;
import com.fooddelivery.dto.response.CartResponse;
import com.fooddelivery.entity.*;
import com.fooddelivery.exception.BadRequestException;
import com.fooddelivery.exception.ResourceNotFoundException;
import com.fooddelivery.mapper.CartMapper;
import com.fooddelivery.repository.CartItemRepository;
import com.fooddelivery.repository.CartRepository;
import com.fooddelivery.repository.FoodRepository;
import com.fooddelivery.repository.UserRepository;
import com.fooddelivery.service.impl.CartServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CartService Tests")
class CartServiceTest {

    @Mock
    private CartRepository cartRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private FoodRepository foodRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CartMapper cartMapper;

    @InjectMocks
    private CartServiceImpl cartService;

    private User customer;
    private Restaurant restaurant;
    private Food food;
    private Cart cart;
    private CartResponse cartResponse;

    @BeforeEach
    void setUp() {
        customer = User.builder()
                .userId(1)
                .username("customer")
                .email("customer@example.com")
                .fullName("Customer")
                .build();

        restaurant = Restaurant.builder()
                .restaurantId(1)
                .restaurantName("Pizza Palace")
                .minOrderValue(BigDecimal.valueOf(50000))
                .deliveryFee(BigDecimal.valueOf(15000))
                .build();

        food = Food.builder()
                .foodId(1)
                .foodName("Margherita Pizza")
                .price(BigDecimal.valueOf(120000))
                .isAvailable(true)
                .restaurant(restaurant)
                .build();

        cart = Cart.builder()
                .cartId(1)
                .user(customer)
                .restaurant(restaurant)
                .totalItems(0)
                .subtotal(BigDecimal.ZERO)
                .items(new ArrayList<>())
                .build();

        cartResponse = CartResponse.builder()
                .cartId(1)
                .restaurantId(1)
                .restaurantName("Pizza Palace")
                .totalItems(0)
                .subtotal(BigDecimal.ZERO)
                .build();
    }

    @Test
    @DisplayName("Should add item to cart successfully")
    void testAddItemToCartSuccess() {
        // Arrange
        AddToCartRequest request = AddToCartRequest.builder()
                .foodId(1)
                .quantity(2)
                .build();

        when(userRepository.findById(anyInt())).thenReturn(Optional.of(customer));
        when(foodRepository.findById(anyInt())).thenReturn(Optional.of(food));
        when(cartRepository.findByUserUserId(anyInt())).thenReturn(Optional.of(cart));
        when(cartItemRepository.findByCartCartIdAndFoodFoodId(anyInt(), anyInt()))
                .thenReturn(Optional.empty());
        when(cartItemRepository.save(any(CartItem.class))).thenReturn(new CartItem());
        when(cartRepository.save(any(Cart.class))).thenReturn(cart);
        when(cartMapper.toCartResponse(any(Cart.class))).thenReturn(cartResponse);

        // Act
        CartResponse result = cartService.addItemToCart(customer.getUserId(), request);

        // Assert
        assertNotNull(result);
        verify(cartItemRepository, times(1)).save(any(CartItem.class));
    }

    @Test
    @DisplayName("Should throw exception when food not available")
    void testAddItemToCartFoodNotAvailable() {
        // Arrange
        AddToCartRequest request = AddToCartRequest.builder()
                .foodId(1)
                .quantity(2)
                .build();

        food.setIsAvailable(false);

        when(userRepository.findById(anyInt())).thenReturn(Optional.of(customer));
        when(foodRepository.findById(anyInt())).thenReturn(Optional.of(food));

        // Act & Assert
        assertThrows(BadRequestException.class,
                () -> cartService.addItemToCart(customer.getUserId(), request));
    }

    @Test
    @DisplayName("Should remove item from cart successfully")
    void testRemoveItemFromCartSuccess() {
        // Arrange
        CartItem cartItem = CartItem.builder()
                .cartItemId(1)
                .cart(cart)
                .food(food)
                .quantity(2)
                .build();

        cart.getItems().add(cartItem);

        when(cartRepository.findByUserUserId(anyInt())).thenReturn(Optional.of(cart));
        when(cartItemRepository.findById(anyInt())).thenReturn(Optional.of(cartItem));
        when(cartRepository.save(any(Cart.class))).thenReturn(cart);
        when(cartMapper.toCartResponse(any(Cart.class))).thenReturn(cartResponse);

        // Act
        CartResponse result = cartService.removeItemFromCart(customer.getUserId(), 1);

        // Assert
        assertNotNull(result);
        verify(cartItemRepository, times(1)).delete(any(CartItem.class));
    }

    @Test
    @DisplayName("Should get cart successfully")
    void testGetCartSuccess() {
        // Arrange
        when(cartRepository.findByUserUserId(anyInt())).thenReturn(Optional.of(cart));
        when(cartMapper.toCartResponse(any(Cart.class))).thenReturn(cartResponse);

        // Act
        CartResponse result = cartService.getCart(customer.getUserId());

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getCartId());
    }
}