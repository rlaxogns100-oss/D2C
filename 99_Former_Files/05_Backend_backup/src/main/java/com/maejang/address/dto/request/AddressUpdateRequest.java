package com.maejang.address.dto.request;

public record AddressUpdateRequest(
        // 부분 수정: null이면 변경하지 않음
        String name,
        String address
) {
}


