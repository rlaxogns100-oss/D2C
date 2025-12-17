package com.maejang.store.dto.request;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalTime;

public record StoreCreateRequest(
        @NotBlank(message = "storeName은 필수입니다.")
        String storeName,

        @NotBlank(message = "address는 필수입니다.")
        String address,

        String description,
        String picture,
        LocalTime openTime,
        LocalTime closeTime
) {
}


