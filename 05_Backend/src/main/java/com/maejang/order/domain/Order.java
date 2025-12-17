package com.maejang.order.domain;

import com.maejang.store.domain.Store;
import com.maejang.user.domain.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "orders") // 'order'는 DB 예약어라 안전하게 orders로 사용
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Long id;

    /**
     * CUSTOMER (또는 OWNER가 직접 주문하는 케이스까지 포함 가능)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Column(name = "price", nullable = false)
    private int price;

    @Column(name = "request", length = 1000)
    private String request;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_status", nullable = false, length = 30)
    private OrderStatus condition;

    @Column(name = "order_at", nullable = false)
    private LocalDateTime orderAt;

    @Builder
    private Order(User user, Store store, int price, String request, OrderStatus condition, LocalDateTime orderAt) {
        this.user = user;
        this.store = store;
        this.price = price;
        this.request = request;
        this.condition = condition;
        this.orderAt = orderAt;
    }

    public void setCondition(OrderStatus condition) {
        this.condition = condition;
    }

    public void setPrice(int price) {
        this.price = price;
    }
}


