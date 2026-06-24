package com.fooddelivery.service.impl;

import com.fooddelivery.dto.request.AddToCartRequest;
import com.fooddelivery.dto.response.CartResponse;
import com.fooddelivery.entity.Cart;
import com.fooddelivery.entity.CartItem;
import com.fooddelivery.entity.Food;
import com.fooddelivery.entity.User;
import com.fooddelivery.exception.BadRequestException;
import com.fooddelivery.exception.ResourceNotFoundException;
import com.fooddelivery.mapper.CartMapper;
import com.fooddelivery.repository.CartItemRepository;
import com.fooddelivery.repository.CartRepository;
import com.fooddelivery.repository.FoodRepository;
import com.fooddelivery.repository.UserRepository;
import com.fooddelivery.service.CartService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Service
@AllArgsConstructor
@Slf4j
@Transactional
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final FoodRepository foodRepository;
    private final UserRepository userRepository;
    private final CartMapper cartMapper;

    @Override
    @Transactional(readOnly = true)
    public CartResponse getCart(Integer userId) {
        log.info("Lấy giỏ hàng của người dùng: {}", userId);

        Cart cart = cartRepository.findByUserUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Giỏ hàng", "userId", userId));

        return cartMapper.toCartResponse(cart);
    }

    @Override
    public CartResponse addItemToCart(Integer userId, AddToCartRequest request) {
        log.info("Thêm sản phẩm vào giỏ hàng của người dùng: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", "id", userId));

        Food food = foodRepository.findById(request.getFoodId())
                .orElseThrow(() -> new ResourceNotFoundException("Món ăn", "id", request.getFoodId()));

        if (!food.getIsAvailable()) {
            throw new BadRequestException("Món ăn này không khả dụng");
        }

        Cart cart = cartRepository.findByUserUserId(userId)
                .orElseGet(() -> {
                    Cart newCart = Cart.builder()
                            .user(user)
                            .restaurant(food.getRestaurant())
                            .totalItems(0)
                            .subtotal(BigDecimal.ZERO)
                            .build();
                    return cartRepository.save(newCart);
                });

        // Check if cart is for same restaurant
        if (cart.getRestaurant() != null &&
                !cart.getRestaurant().getRestaurantId().equals(food.getRestaurant().getRestaurantId())) {
            throw new BadRequestException("Không thể thêm món ăn từ nhà hàng khác. Vui lòng xóa giỏ hàng trước");
        }

        // Set restaurant if not set
        if (cart.getRestaurant() == null) {
            cart.setRestaurant(food.getRestaurant());
        }

        Optional<CartItem> existingItem = cartItemRepository.findByCartCartIdAndFoodFoodId(
                cart.getCartId(), food.getFoodId());

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
            item.calculateTotalPrice();
            cartItemRepository.save(item);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .food(food)
                    .quantity(request.getQuantity())
                    .unitPrice(food.getPrice())
                    .build();
            newItem.calculateTotalPrice();
            cartItemRepository.save(newItem);
        }

        updateCartTotals(cart);
        log.info("Thêm sản phẩm vào giỏ hàng thành công");

        return cartMapper.toCartResponse(cart);
    }

    @Override
    public CartResponse updateCartItem(Integer userId, Integer cartItemId, Integer quantity) {
        log.info("Cập nhật số lượng sản phẩm trong giỏ hàng");

        Cart cart = cartRepository.findByUserUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Giỏ hàng", "userId", userId));

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm trong giỏ", "id", cartItemId));

        if (!cartItem.getCart().getCartId().equals(cart.getCartId())) {
            throw new BadRequestException("Sản phẩm này không trong giỏ hàng của bạn");
        }

        if (quantity <= 0) {
            throw new BadRequestException("Số lượng phải lớn hơn 0");
        }

        cartItem.setQuantity(quantity);
        cartItem.calculateTotalPrice();
        cartItemRepository.save(cartItem);

        updateCartTotals(cart);
        log.info("Cập nhật số lượng sản phẩm thành công");

        return cartMapper.toCartResponse(cart);
    }

    @Override
    public CartResponse removeItemFromCart(Integer userId, Integer cartItemId) {
        log.info("Xóa sản phẩm khỏi giỏ hàng");

        Cart cart = cartRepository.findByUserUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Giỏ hàng", "userId", userId));

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm trong giỏ", "id", cartItemId));

        if (!cartItem.getCart().getCartId().equals(cart.getCartId())) {
            throw new BadRequestException("Sản phẩm này không trong giỏ hàng của bạn");
        }

        cartItemRepository.delete(cartItem);

        updateCartTotals(cart);
        log.info("Xóa sản phẩm khỏi giỏ hàng thành công");

        return cartMapper.toCartResponse(cart);
    }

    @Override
    public CartResponse clearCart(Integer userId) {
        log.info("Xóa toàn bộ giỏ hàng của người dùng: {}", userId);

        Cart cart = cartRepository.findByUserUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Giỏ hàng", "userId", userId));

        cart.getItems().clear();
        cart.setTotalItems(0);
        cart.setSubtotal(BigDecimal.ZERO);

        cartRepository.save(cart);
        log.info("Xóa toàn bộ giỏ hàng thành công");

        return cartMapper.toCartResponse(cart);
    }

    private void updateCartTotals(Cart cart) {
        BigDecimal subtotal = cart.getItems().stream()
                .map(CartItem::getTotalPrice)
                .filter(price -> price != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalItems = cart.getItems().stream()
                .mapToInt(CartItem::getQuantity)
                .sum();

        cart.setSubtotal(subtotal);
        cart.setTotalItems(totalItems);

        cartRepository.save(cart);
    }
}