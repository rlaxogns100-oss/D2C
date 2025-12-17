package com.maejang.order.domain;

public enum OrderStatus {
    WAITING_FOR_PAYMENT, // 입금대기 (무통장입금 시)
    ORDERED,       // 주문완료 (결제완료)
    COOKING,       // 조리중
    DELIVERING,    // 배달중
    DELIVERED,     // 배달완료
    REJECTED,      // 거절됨
    CANCELLED      // 취소됨
}


