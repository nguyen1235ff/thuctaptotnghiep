package com.fooddelivery.controller;

import com.fooddelivery.dto.request.AddToCartRequest;
import com.fooddelivery.dto.response.CartResponse;
import com.fooddelivery.security.UserPrincipal;
import com.fooddelivery.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart")
@AllArgsConstructor
@Tag(name = "Cart", description = "API quản lý giỏ hàng")
public class CartController {

    private final CartService cartService;

    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Lấy giỏ hàng", description = "Lấy thông tin giỏ hàng của khách hàng")
    public ResponseEntity<CartResponse> getCart(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        CartResponse cart = cartService.getCart(userPrincipal.getUserId());
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/items")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Thêm sản phẩm vào giỏ", description = "Thêm một sản phẩm vào giỏ hàng")
    public ResponseEntity<CartResponse> addItemToCart(
            @Valid @RequestBody AddToCartRequest request,
            Authentication authentication) {

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        CartResponse cart = cartService.addItemToCart(userPrincipal.getUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(cart);
    }

    @PutMapping("/items/{cartItemId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Cập nhật số lượng sản phẩm", description = "Cập nhật số lượng của sản phẩm trong giỏ")
    public ResponseEntity<CartResponse> updateCartItem(
            @Parameter(description = "ID sản phẩm trong giỏ")
            @PathVariable Integer cartItemId,
            @Parameter(description = "Số lượng mới")
            @RequestParam Integer quantity,
            Authentication authentication) {

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        CartResponse cart = cartService.updateCartItem(userPrincipal.getUserId(), cartItemId, quantity);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/items/{cartItemId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Xóa sản phẩm khỏi giỏ", description = "Xóa một sản phẩm khỏi giỏ hàng")
    public ResponseEntity<CartResponse> removeItemFromCart(
            @Parameter(description = "ID sản phẩm trong giỏ")
            @PathVariable Integer cartItemId,
            Authentication authentication) {

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        CartResponse cart = cartService.removeItemFromCart(userPrincipal.getUserId(), cartItemId);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Xóa toàn bộ giỏ hàng", description = "Xóa tất cả sản phẩm trong giỏ")
    public ResponseEntity<CartResponse> clearCart(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        CartResponse cart = cartService.clearCart(userPrincipal.getUserId());
        return ResponseEntity.ok(cart);
    }
}