package com.maejang.order.dto.request;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public record OrderCreateRequest(
        @NotNull(message = "storeId는 필수입니다.")
        Long storeId,

        String request,

        @NotNull(message = "items는 필수입니다.")
        List<OrderItemRequest> items
) {
    public record OrderItemRequest(
            @NotNull(message = "menuId는 필수입니다.")
            Long menuId,
            String option,
            @NotNull(message = "count는 필수입니다.")
            Integer count
    ) {}
}


