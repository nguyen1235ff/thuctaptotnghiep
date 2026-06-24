package com.fooddelivery.service.impl;

import com.fooddelivery.dto.request.CreateOrderRequest;
import com.fooddelivery.dto.response.OrderResponse;
import com.fooddelivery.entity.*;
import com.fooddelivery.exception.BadRequestException;
import com.fooddelivery.exception.ForbiddenException;
import com.fooddelivery.exception.ResourceNotFoundException;
import com.fooddelivery.mapper.OrderMapper;
import com.fooddelivery.repository.*;
import com.fooddelivery.service.OrderService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@AllArgsConstructor
@Slf4j
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final RestaurantRepository restaurantRepository;
    private final VoucherRepository voucherRepository;
    private final UserRepository userRepository;
    private final OrderMapper orderMapper;

    @Override
    public OrderResponse createOrder(Integer userId, CreateOrderRequest request) {
        log.info("Tạo đơn hàng mới cho người dùng: {}", userId);

        User customer = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", "id", userId));

        Cart cart = cartRepository.findByUserUserId(userId)
                .orElseThrow(() -> new BadRequestException("Giỏ hàng trống"));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Giỏ hàng không có sản phẩm");
        }

        Restaurant restaurant = cart.getRestaurant();
        if (restaurant == null) {
            throw new BadRequestException("Không xác định được nhà hàng");
        }

        // Calculate subtotal
        BigDecimal subtotal = cart.getSubtotal();

        // Check minimum order value
        if (subtotal.compareTo(restaurant.getMinOrderValue()) < 0) {
            throw new BadRequestException(
                    "Đơn hàng tối thiểu là " + restaurant.getMinOrderValue() + " đ"
            );
        }

        // Apply voucher if provided
        BigDecimal discountAmount = BigDecimal.ZERO;
        Voucher voucher = null;

        if (request.getVoucherCode() != null && !request.getVoucherCode().isEmpty()) {
            voucher = voucherRepository.findValidVoucher(
                    request.getVoucherCode(),
                    LocalDateTime.now()
            ).orElseThrow(() -> new ResourceNotFoundException(
                    "Voucher", "code", request.getVoucherCode()
            ));

            // Check minimum order value for voucher
            if (subtotal.compareTo(voucher.getMinOrderValue()) < 0) {
                throw new BadRequestException(
                        "Voucher này yêu cầu đơn hàng tối thiểu " + voucher.getMinOrderValue() + " đ"
                );
            }

            // Calculate discount
            if ("PERCENTAGE".equals(voucher.getDiscountType())) {
                discountAmount = subtotal.multiply(voucher.getDiscountValue())
                        .divide(BigDecimal.valueOf(100));
            } else {
                discountAmount = voucher.getDiscountValue();
            }

            // Update voucher usage
            voucher.setUsedCount(voucher.getUsedCount() + 1);
            voucherRepository.save(voucher);
        }

        // Calculate total
        BigDecimal deliveryFee = restaurant.getDeliveryFee();
        BigDecimal totalAmount = subtotal.add(deliveryFee).subtract(discountAmount);

        // Generate order code
        String orderCode = generateOrderCode();

        String paymentMethod = request.getPaymentMethod() != null ? request.getPaymentMethod() : "COD";
        if (!paymentMethod.equals("COD") && !paymentMethod.equals("MOMO")) {
            throw new BadRequestException("Phương thức thanh toán không hợp lệ. Hỗ trợ: COD, MOMO");
        }

        // Create order
        Order order = Order.builder()
                .orderCode(orderCode)
                .customer(customer)
                .restaurant(restaurant)
                .deliveryAddress(request.getDeliveryAddress())
                .deliveryPhone(request.getDeliveryPhone())
                .subtotal(subtotal)
                .deliveryFee(deliveryFee)
                .discountAmount(discountAmount)
                .voucher(voucher)
                .totalAmount(totalAmount)
                .orderStatus("PENDING")
                .paymentMethod(paymentMethod)
                .notes(request.getNotes())
                .build();

        Order savedOrder = orderRepository.save(order);

        // Create order items from cart items
        for (CartItem cartItem : cart.getItems()) {
            OrderItem orderItem = OrderItem.builder()
                    .order(savedOrder)
                    .food(cartItem.getFood())
                    .foodName(cartItem.getFood().getFoodName())
                    .quantity(cartItem.getQuantity())
                    .unitPrice(cartItem.getUnitPrice())
                    .totalPrice(cartItem.getTotalPrice())
                    .build();

            orderItemRepository.save(orderItem);
        }

        // Create order status history
        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(savedOrder)
                .orderStatus("PENDING")
                .changedBy(customer)
                .notes("Đơn hàng vừa được tạo")
                .build();

        orderStatusHistoryRepository.save(history);

        // Clear cart
        cartItemRepository.deleteAll(cart.getItems());
        cart.setItems(null);
        cart.setSubtotal(BigDecimal.ZERO);
        cart.setTotalItems(0);
        cartRepository.save(cart);

        log.info("Tạo đơn hàng thành công với mã: {}", orderCode);

        return orderMapper.toOrderResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Integer orderId, Integer userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng", "id", orderId));

        // Check permission: customer, restaurant owner, or assigned shipper
        boolean isCustomer = order.getCustomer().getUserId().equals(userId);
        boolean isOwner = order.getRestaurant().getOwner().getUserId().equals(userId);
        boolean isShipper = order.getShipper() != null && order.getShipper().getUserId().equals(userId);

        if (!isCustomer && !isOwner && !isShipper) {
            throw new ForbiddenException("Bạn không có quyền xem đơn hàng này");
        }

        return orderMapper.toOrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderByCode(String orderCode) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng", "code", orderCode));

        return orderMapper.toOrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getMyOrders(Integer userId, Pageable pageable) {
        log.info("Lấy danh sách đơn hàng của người dùng: {}", userId);

        Page<Order> orders = orderRepository.findByCustomerUserIdOrderByCreatedAtDesc(userId, pageable);
        return orders.map(orderMapper::toOrderResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getRestaurantOrders(Integer restaurantId, Integer ownerId, Pageable pageable) {
        log.info("Lấy danh sách đơn hàng của nhà hàng: {}", restaurantId);

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Nhà hàng", "id", restaurantId));

        if (!restaurant.getOwner().getUserId().equals(ownerId)) {
            throw new ForbiddenException("Bạn không có quyền xem đơn hàng của nhà hàng này");
        }

        Page<Order> orders = orderRepository.findByRestaurantRestaurantIdOrderByCreatedAtDesc(restaurantId, pageable);
        return orders.map(orderMapper::toOrderResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getShipperOrders(Integer shipperId, String status, Pageable pageable) {
        log.info("Lấy danh sách đơn hàng shipper: {} với trạng thái: {}", shipperId, status);

        Page<Order> orders;
        if ("READY_FOR_PICKUP".equals(status)) {
            orders = orderRepository.findByOrderStatusAndShipperIsNullOrderByCreatedAtDesc(status, pageable);
        } else {
            orders = orderRepository.findByShipperUserIdAndOrderStatusOrderByCreatedAtDesc(
                    shipperId, status, pageable);
        }
        return orders.map(orderMapper::toOrderResponse);
    }

    @Override
    public OrderResponse updateOrderStatus(Integer orderId, String newStatus, Integer userId) {
        log.info("Cập nhật trạng thái đơn hàng: {} thành: {}", orderId, newStatus);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng", "id", orderId));

        // Validate status
        if (!isValidStatus(newStatus)) {
            throw new BadRequestException("Trạng thái không hợp lệ");
        }

        // Check permission
        if (!order.getRestaurant().getOwner().getUserId().equals(userId) &&
                (order.getShipper() == null || !order.getShipper().getUserId().equals(userId))) {
            throw new ForbiddenException("Bạn không có quyền cập nhật đơn hàng này");
        }

        // Validate status transition
        if (!isValidStatusTransition(order.getOrderStatus(), newStatus)) {
            throw new BadRequestException(
                    "Không thể chuyển từ " + order.getOrderStatus() + " sang " + newStatus
            );
        }

        // Update status
        String oldStatus = order.getOrderStatus();
        order.setOrderStatus(newStatus);

        // Update shipper for DELIVERING status
        if ("DELIVERING".equals(newStatus) && order.getShipper() == null) {
            User shipper = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Shipper", "id", userId));
            order.setShipper(shipper);
        }

        Order updatedOrder = orderRepository.save(order);

        // Create status history
        User changedBy = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", "id", userId));

        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(updatedOrder)
                .orderStatus(newStatus)
                .changedBy(changedBy)
                .notes("Cập nhật từ " + oldStatus + " sang " + newStatus)
                .build();

        orderStatusHistoryRepository.save(history);

        log.info("Cập nhật trạng thái đơn hàng thành công");

        return orderMapper.toOrderResponse(updatedOrder);
    }

    @Override
    public OrderResponse cancelOrder(Integer orderId, Integer userId) {
        log.info("Hủy đơn hàng: {}", orderId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng", "id", orderId));

        // Check permission
        if (!order.getCustomer().getUserId().equals(userId)) {
            throw new ForbiddenException("Bạn không có quyền hủy đơn hàng này");
        }

        // Check if order can be cancelled
        if ("COMPLETED".equals(order.getOrderStatus()) ||
                "CANCELLED".equals(order.getOrderStatus()) ||
                "DELIVERING".equals(order.getOrderStatus())) {
            throw new BadRequestException("Không thể hủy đơn hàng ở trạng thái này");
        }

        order.setOrderStatus("CANCELLED");
        Order cancelledOrder = orderRepository.save(order);

        // Refund voucher usage
        if (order.getVoucher() != null) {
            Voucher voucher = order.getVoucher();
            voucher.setUsedCount(Math.max(0, voucher.getUsedCount() - 1));
            voucherRepository.save(voucher);
        }

        // Create status history
        User customer = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", "id", userId));

        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(cancelledOrder)
                .orderStatus("CANCELLED")
                .changedBy(customer)
                .notes("Đơn hàng bị hủy")
                .build();

        orderStatusHistoryRepository.save(history);

        log.info("Hủy đơn hàng thành công");

        return orderMapper.toOrderResponse(cancelledOrder);
    }

    @Override
    public void acceptOrder(Integer orderId, Integer shipperId) {
        log.info("Shipper {} nhận đơn hàng: {}", shipperId, orderId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng", "id", orderId));

        if (!"READY_FOR_PICKUP".equals(order.getOrderStatus())) {
            throw new BadRequestException("Đơn hàng không ở trạng thái sẵn sàng giao");
        }

        User shipper = userRepository.findById(shipperId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipper", "id", shipperId));

        order.setShipper(shipper);
        order.setOrderStatus("DELIVERING");

        orderRepository.save(order);

        // Create status history
        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(order)
                .orderStatus("DELIVERING")
                .changedBy(shipper)
                .notes("Shipper đã nhận đơn hàng")
                .build();

        orderStatusHistoryRepository.save(history);

        log.info("Shipper nhận đơn hàng thành công");
    }

    private String generateOrderCode() {
        // Format: ORD + timestamp + random number
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        String timestamp = LocalDateTime.now().format(formatter);
        int random = (int) (Math.random() * 10000);
        return String.format("ORD%s%04d", timestamp, random);
    }

    private boolean isValidStatus(String status) {
        return status.matches("PENDING|CONFIRMED|PREPARING|READY_FOR_PICKUP|DELIVERING|COMPLETED|CANCELLED");
    }

    private boolean isValidStatusTransition(String fromStatus, String toStatus) {
        return switch (fromStatus) {
            case "PENDING" -> toStatus.equals("CONFIRMED") || toStatus.equals("CANCELLED");
            case "CONFIRMED" -> toStatus.equals("PREPARING") || toStatus.equals("CANCELLED");
            case "PREPARING" -> toStatus.equals("READY_FOR_PICKUP") || toStatus.equals("CANCELLED");
            case "READY_FOR_PICKUP" -> toStatus.equals("DELIVERING");
            case "DELIVERING" -> toStatus.equals("COMPLETED");
            case "COMPLETED", "CANCELLED" -> false;
            default -> false;
        };
    }
}