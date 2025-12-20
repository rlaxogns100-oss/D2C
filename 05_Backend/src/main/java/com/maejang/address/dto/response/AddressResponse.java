package com.maejang.address.dto.response;

import com.maejang.address.domain.Address;

public record AddressResponse(
        Long addressId,
        String name, // 집, 회사 ,,
        String address, // 주소
        boolean isDefault,
        Double latitude,
        Double longitude
) {
    public static AddressResponse from(Address a) {
        return new AddressResponse(a.getAddressId(), a.getName(), a.getAddress(), a.isDefault(), a.getLatitude(), a.getLongitude());
    }
}


