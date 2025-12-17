package com.maejang.order.repository;

import com.maejang.order.domain.Order;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderRepository extends JpaRepository<Order, Long> {
    
    @Query("SELECT o FROM Order o JOIN FETCH o.user WHERE o.user.id = :userId")
    List<Order> findByUserId(@Param("userId") Long userId);

    @Query("SELECT o FROM Order o JOIN FETCH o.user WHERE o.id = :orderId")
    Optional<Order> findById(@Param("orderId") Long orderId);

    @Query("SELECT o FROM Order o JOIN FETCH o.user WHERE o.store.id = :storeId")
    List<Order> findByStoreId(@Param("storeId") Long storeId);
}


