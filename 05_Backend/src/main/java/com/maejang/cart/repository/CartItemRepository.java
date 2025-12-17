package com.maejang.cart.repository;

import com.maejang.cart.domain.CartItem;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    
    @Query("SELECT c FROM CartItem c JOIN FETCH c.menu WHERE c.user.id = :userId")
    List<CartItem> findByUserId(@Param("userId") Long userId);
}


