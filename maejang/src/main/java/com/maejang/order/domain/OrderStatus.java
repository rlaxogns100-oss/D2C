package com.maejang.order.domain;

public enum OrderStatus {
    ORDERED,       // 주문완료
    COOKING,       // 조리중
    DELIVERING,    // 배달중
    DELIVERED,     // 배달완료
    REJECTED,      // 거절됨
    CANCELLED      // 취소됨
}


