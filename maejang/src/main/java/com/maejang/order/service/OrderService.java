package com.maejang.order.service;

import com.maejang.global.exception.CustomException;
import com.maejang.global.exception.ErrorCode;
import com.maejang.menu.domain.Menu;
import com.maejang.menu.repository.MenuRepository;
import com.maejang.order.domain.Order;
import com.maejang.order.domain.OrderMenu;
import com.maejang.order.domain.OrderStatus;
import com.maejang.order.dto.request.OrderCreateRequest;
import com.maejang.order.repository.OrderMenuRepository;
import com.maejang.order.repository.OrderRepository;
import com.maejang.user.domain.User;
import com.maejang.user.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderMenuRepository orderMenuRepository;
    private final UserRepository userRepository;
    private final MenuRepository menuRepository;

    @Transactional
    public Long create(Long userId, OrderCreateRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        Order order = Order.builder()
                .user(user)
                .price(0)
                .request(req.request())
                .condition(OrderStatus.ORDERED)
                .orderAt(LocalDateTime.now())
                .build();

        order = orderRepository.save(order);

        int total = 0;
        for (OrderCreateRequest.OrderItemRequest item : req.items()) {
            Menu menu = menuRepository.findById(item.menuId())
                    .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));

            int count = item.count() == null ? 0 : item.count();
            total += menu.getPrice() * count;

            OrderMenu om = OrderMenu.builder()
                    .menu(menu)
                    .order(order)
                    .option(item.option())
                    .count(count)
                    .build();
            orderMenuRepository.save(om);
        }

        order.setPrice(total);
        return order.getId();
    }

    @Transactional(readOnly = true)
    public Order read(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));
    }

    @Transactional(readOnly = true)
    public List<Order> history(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    @Transactional
    public void cancelByCustomer(Long userId, Long orderId) {
        Order order = read(orderId);
        if (!order.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }
        order.setCondition(OrderStatus.CANCELLED);
    }

    @Transactional
    public void acceptByOwner(Long orderId) {
        Order order = read(orderId);
        order.setCondition(OrderStatus.COOKING);
    }

    @Transactional
    public void rejectByOwner(Long orderId) {
        Order order = read(orderId);
        order.setCondition(OrderStatus.REJECTED);
    }
}


