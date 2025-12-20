package com.maejang.store.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record DeliveryAreaUpdateRequest(
        @NotNull(message = "위도는 필수입니다.")
        Double latitude,

        @NotNull(message = "경도는 필수입니다.")
        Double longitude,

        @NotNull(message = "배달 반경은 필수입니다.")
        @Positive(message = "배달 반경은 양수여야 합니다.")
        Double deliveryRadius // 배달 반경 (km)
) {
}

