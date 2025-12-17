package com.maejang.cart.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CartCreateRequest(
        @NotNull(message = "menuId는 필수입니다.")
        Long menuId,

        String option,

        @Min(value = 1, message = "count는 1 이상이어야 합니다.")
        int count
) {
}


