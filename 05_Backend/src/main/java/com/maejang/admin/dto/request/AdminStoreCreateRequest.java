package com.maejang.admin.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AdminStoreCreateRequest(
        @NotNull(message = "userId는 필수입니다.")
        Long userId,

        @NotBlank(message = "storeName은 필수입니다.")
        String storeName,

        @NotBlank(message = "subdomain은 필수입니다.")
        String subdomain,

        @NotBlank(message = "address는 필수입니다.")
        String address,

        String description
) {
}


