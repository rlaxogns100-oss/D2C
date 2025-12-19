package com.maejang.menu.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record MenuUpsertRequest(
        @NotBlank(message = "name은 필수입니다.")
        String menuName,

        String picture,

        @Min(value = 0, message = "price는 0 이상이어야 합니다.")
        int price,

        String description,
        String option,
        String category
) {
}


