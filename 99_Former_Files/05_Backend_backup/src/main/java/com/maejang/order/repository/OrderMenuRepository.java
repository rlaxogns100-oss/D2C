package com.maejang.order.repository;

import com.maejang.order.domain.OrderMenu;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderMenuRepository extends JpaRepository<OrderMenu, Long> {
    List<OrderMenu> findByOrderId(Long orderId);
}


