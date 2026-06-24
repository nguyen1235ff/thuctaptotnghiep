package com.fooddelivery.controller;

import com.fooddelivery.dto.request.CreateOrderRequest;
import com.fooddelivery.dto.response.OrderResponse;
import com.fooddelivery.security.UserPrincipal;
import com.fooddelivery.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
@AllArgsConstructor
@Tag(name = "Order", description = "API quản lý đơn hàng")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Tạo đơn hàng", description = "Tạo đơn hàng mới từ giỏ hàng")
    public ResponseEntity<OrderResponse> createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            Authentication authentication) {

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        OrderResponse order = orderService.createOrder(userPrincipal.getUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('RESTAURANT') or hasRole('SHIPPER')")
    @Operation(summary = "Lấy chi tiết đơn hàng", description = "Lấy thông tin chi tiết của một đơn hàng")
    public ResponseEntity<OrderResponse> getOrderById(
            @Parameter(description = "ID đơn hàng")
            @PathVariable Integer id,
            Authentication authentication) {

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        OrderResponse order = orderService.getOrderById(id, userPrincipal.getUserId());
        return ResponseEntity.ok(order);
    }

    @GetMapping("/code/{code}")
    @Operation(summary = "Lấy đơn hàng theo mã", description = "Lấy thông tin đơn hàng theo mã đơn hàng")
    public ResponseEntity<OrderResponse> getOrderByCode(
            @Parameter(description = "Mã đơn hàng")
            @PathVariable String code) {

        OrderResponse order = orderService.getOrderByCode(code);
        return ResponseEntity.ok(order);
    }

    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Lấy danh sách đơn hàng của tôi", description = "Lấy danh sách đơn hàng của khách hàng")
    public ResponseEntity<Page<OrderResponse>> getMyOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Pageable pageable = PageRequest.of(page, size);
        Page<OrderResponse> orders = orderService.getMyOrders(userPrincipal.getUserId(), pageable);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/restaurant/{restaurantId}")
    @PreAuthorize("hasRole('RESTAURANT')")
    @Operation(summary = "Lấy đơn hàng của nhà hàng", description = "Lấy danh sách đơn hàng của nhà hàng")
    public ResponseEntity<Page<OrderResponse>> getRestaurantOrders(
            @PathVariable Integer restaurantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Pageable pageable = PageRequest.of(page, size);
        Page<OrderResponse> orders = orderService.getRestaurantOrders(
                restaurantId, userPrincipal.getUserId(), pageable);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/shipper/pending")
    @PreAuthorize("hasRole('SHIPPER')")
    @Operation(summary = "Lấy đơn chờ giao", description = "Lấy danh sách đơn hàng sẵn sàng giao")
    public ResponseEntity<Page<OrderResponse>> getShipperOrders(
            @RequestParam(defaultValue = "READY_FOR_PICKUP") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Pageable pageable = PageRequest.of(page, size);
        Page<OrderResponse> orders = orderService.getShipperOrders(
                userPrincipal.getUserId(), status, pageable);
        return ResponseEntity.ok(orders);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('RESTAURANT') or hasRole('SHIPPER')")
    @Operation(summary = "Cập nhật trạng thái đơn hàng", description = "Cập nhật trạng thái của đơn hàng")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Integer id,
            @Parameter(description = "Trạng thái mới (PENDING, CONFIRMED, PREPARING, READY_FOR_PICKUP, DELIVERING, COMPLETED, CANCELLED)")
            @RequestParam String status,
            Authentication authentication) {

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        OrderResponse order = orderService.updateOrderStatus(id, status, userPrincipal.getUserId());
        return ResponseEntity.ok(order);
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Hủy đơn hàng", description = "Hủy đơn hàng (chỉ khi chưa giao)")
    public ResponseEntity<OrderResponse> cancelOrder(
            @PathVariable Integer id,
            Authentication authentication) {

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        OrderResponse order = orderService.cancelOrder(id, userPrincipal.getUserId());
        return ResponseEntity.ok(order);
    }

    @PostMapping("/{id}/accept")
    @PreAuthorize("hasRole('SHIPPER')")
    @Operation(summary = "Nhận đơn hàng", description = "Shipper nhận đơn hàng để giao")
    public ResponseEntity<Void> acceptOrder(
            @PathVariable Integer id,
            Authentication authentication) {

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        orderService.acceptOrder(id, userPrincipal.getUserId());
        return ResponseEntity.noContent().build();
    }
}