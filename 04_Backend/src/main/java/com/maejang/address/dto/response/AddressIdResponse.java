package com.maejang.address.dto.response;

public record AddressIdResponse(
        Long addressId,
        String name, // 집, 회사 ,,
        String address // 주소
) {
}


