package com.fooddelivery.service;

import com.fooddelivery.dto.request.CreateOrderRequest;
import com.fooddelivery.dto.response.OrderResponse;
import com.fooddelivery.entity.*;
import com.fooddelivery.exception.BadRequestException;
import com.fooddelivery.exception.ForbiddenException;
import com.fooddelivery.mapper.OrderMapper;
import com.fooddelivery.repository.*;
import com.fooddelivery.service.impl.OrderServiceImpl;
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
@DisplayName("OrderService Tests")
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private OrderStatusHistoryRepository orderStatusHistoryRepository;

    @Mock
    private CartRepository cartRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private RestaurantRepository restaurantRepository;

    @Mock
    private VoucherRepository voucherRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrderMapper orderMapper;

    @InjectMocks
    private OrderServiceImpl orderService;

    private User customer;
    private User restaurantOwner;
    private Restaurant restaurant;
    private Cart cart;
    private Order order;
    private CreateOrderRequest createOrderRequest;

    @BeforeEach
    void setUp() {
        customer = User.builder()
                .userId(1)
                .username("customer")
                .email("customer@example.com")
                .fullName("Customer")
                .build();

        restaurantOwner = User.builder()
                .userId(2)
                .username("owner")
                .email("owner@example.com")
                .fullName("Owner")
                .build();

        restaurant = Restaurant.builder()
                .restaurantId(1)
                .restaurantName("Pizza Palace")
                .minOrderValue(BigDecimal.valueOf(50000))
                .deliveryFee(BigDecimal.valueOf(15000))
                .owner(restaurantOwner)
                .build();

        cart = Cart.builder()
                .cartId(1)
                .user(customer)
                .restaurant(restaurant)
                .totalItems(1)
                .subtotal(BigDecimal.valueOf(120000))
                .items(new ArrayList<>())
                .build();

        order = Order.builder()
                .orderId(1)
                .orderCode("ORD20240101000001")
                .customer(customer)
                .restaurant(restaurant)
                .deliveryAddress("123 Customer St")
                .deliveryPhone("0901234567")
                .subtotal(BigDecimal.valueOf(120000))
                .deliveryFee(BigDecimal.valueOf(15000))
                .totalAmount(BigDecimal.valueOf(135000))
                .orderStatus("PENDING")
                .items(new ArrayList<>())
                .statusHistory(new ArrayList<>())
                .build();

        createOrderRequest = CreateOrderRequest.builder()
                .deliveryAddress("123 Customer St")
                .deliveryPhone("0901234567")
                .notes("Please ring bell")
                .build();
    }

    @Test
    @DisplayName("Should create order successfully")
    void testCreateOrderSuccess() {
        // Arrange
        when(userRepository.findById(anyInt())).thenReturn(Optional.of(customer));
        when(cartRepository.findByUserUserId(anyInt())).thenReturn(Optional.of(cart));
        when(orderRepository.save(any(Order.class))).thenReturn(order);
        when(orderItemRepository.save(any(OrderItem.class))).thenReturn(new OrderItem());
        when(orderStatusHistoryRepository.save(any(OrderStatusHistory.class))).thenReturn(new OrderStatusHistory());
        doNothing().when(cartItemRepository).deleteAll(any());
        when(cartRepository.save(any(Cart.class))).thenReturn(cart);
        when(orderMapper.toOrderResponse(any(Order.class)))
                .thenReturn(OrderResponse.builder()
                        .orderId(1)
                        .orderCode("ORD20240101000001")
                        .totalAmount(BigDecimal.valueOf(135000))
                        .orderStatus("PENDING")
                        .build());

        // Act
        OrderResponse result = orderService.createOrder(customer.getUserId(), createOrderRequest);

        // Assert
        assertNotNull(result);
        assertEquals("PENDING", result.getOrderStatus());
        verify(orderRepository, times(1)).save(any(Order.class));
    }

    @Test
    @DisplayName("Should throw exception when cart is empty")
    void testCreateOrderEmptyCart() {
        // Arrange
        cart.getItems().clear();

        when(userRepository.findById(anyInt())).thenReturn(Optional.of(customer));
        when(cartRepository.findByUserUserId(anyInt())).thenReturn(Optional.of(cart));

        // Act & Assert
        assertThrows(BadRequestException.class,
                () -> orderService.createOrder(customer.getUserId(), createOrderRequest));
    }

    @Test
    @DisplayName("Should throw exception when order amount is below minimum")
    void testCreateOrderBelowMinimum() {
        // Arrange
        cart.setSubtotal(BigDecimal.valueOf(30000));

        when(userRepository.findById(anyInt())).thenReturn(Optional.of(customer));
        when(cartRepository.findByUserUserId(anyInt())).thenReturn(Optional.of(cart));

        // Act & Assert
        assertThrows(BadRequestException.class,
                () -> orderService.createOrder(customer.getUserId(), createOrderRequest));
    }

    @Test
    @DisplayName("Should cancel order successfully")
    void testCancelOrderSuccess() {
        // Arrange
        when(orderRepository.findById(anyInt())).thenReturn(Optional.of(order));
        when(userRepository.findById(anyInt())).thenReturn(Optional.of(customer));
        when(orderStatusHistoryRepository.save(any(OrderStatusHistory.class)))
                .thenReturn(new OrderStatusHistory());
        when(orderRepository.save(any(Order.class))).thenReturn(order);
        when(orderMapper.toOrderResponse(any(Order.class)))
                .thenReturn(OrderResponse.builder()
                        .orderId(1)
                        .orderStatus("CANCELLED")
                        .build());

        // Act
        OrderResponse result = orderService.cancelOrder(1, customer.getUserId());

        // Assert
        assertNotNull(result);
        assertEquals("CANCELLED", result.getOrderStatus());
    }

    @Test
    @DisplayName("Should throw exception when non-customer tries to cancel order")
    void testCancelOrderUnauthorized() {
        // Arrange
        when(orderRepository.findById(anyInt())).thenReturn(Optional.of(order));

        // Act & Assert
        assertThrows(ForbiddenException.class,
                () -> orderService.cancelOrder(1, 999));
    }

    @Test
    @DisplayName("Should throw exception when cancelling completed order")
    void testCancelCompletedOrder() {
        // Arrange
        order.setOrderStatus("COMPLETED");

        when(orderRepository.findById(anyInt())).thenReturn(Optional.of(order));

        // Act & Assert
        assertThrows(BadRequestException.class,
                () -> orderService.cancelOrder(1, customer.getUserId()));
    }
}