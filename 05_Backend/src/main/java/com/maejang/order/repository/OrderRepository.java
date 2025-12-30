package com.maejang.order.repository;

import com.maejang.order.domain.Order;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderRepository extends JpaRepository<Order, Long> {
    
    @Query("SELECT DISTINCT o FROM Order o JOIN FETCH o.user JOIN FETCH o.store LEFT JOIN FETCH o.orderMenus WHERE o.user.id = :userId ORDER BY o.orderAt DESC")
    List<Order> findByUserId(@Param("userId") Long userId);

    @Query("SELECT DISTINCT o FROM Order o JOIN FETCH o.user JOIN FETCH o.store LEFT JOIN FETCH o.orderMenus WHERE o.id = :orderId")
    Optional<Order> findById(@Param("orderId") Long orderId);

    @Query("SELECT DISTINCT o FROM Order o JOIN FETCH o.user JOIN FETCH o.store LEFT JOIN FETCH o.orderMenus WHERE o.store.id = :storeId ORDER BY o.orderAt DESC")
    List<Order> findByStoreId(@Param("storeId") Long storeId);
}


