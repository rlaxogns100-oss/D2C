package com.maejang.address.dto.request;

import jakarta.validation.constraints.NotBlank;

public record AddressCreateRequest(
        @NotBlank(message = "name은 필수입니다.")
        String name,

        @NotBlank(message = "address는 필수입니다.")
        String address,

        Double latitude,

        Double longitude
) {
}


