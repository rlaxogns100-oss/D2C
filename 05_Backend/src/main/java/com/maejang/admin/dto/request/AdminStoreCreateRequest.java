package com.maejang.admin.dto.request;

import jakarta.validation.constraints.NotBlank;

public record AdminStoreCreateRequest(
        Long userId, // 선택 사항으로 변경

        @NotBlank(message = "storeName은 필수입니다.")
        String storeName,

        @NotBlank(message = "subdomain은 필수입니다.")
        String subdomain,

        @NotBlank(message = "address는 필수입니다.")
        String address,

        String description
) {
}


