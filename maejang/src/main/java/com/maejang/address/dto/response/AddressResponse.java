package com.maejang.address.dto.response;

import com.maejang.address.domain.Address;

public record AddressResponse(
        Long addressId,
        String name,
        String address,
        boolean isDefault
) {
    public static AddressResponse from(Address a) {
        return new AddressResponse(a.getAddressId(), a.getName(), a.getAddress(), a.isDefault());
    }
}


