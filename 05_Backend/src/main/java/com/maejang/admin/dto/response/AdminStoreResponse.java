package com.maejang.admin.dto.response;

import com.maejang.store.domain.Store;

public record AdminStoreResponse(
        Long storeId,
        Long ownerId,
        String ownerEmail,
        String storeName,
        String subdomain,
        String address,
        boolean isOpen
) {
    public static AdminStoreResponse from(Store s) {
        return new AdminStoreResponse(
                s.getId(),
                s.getOwner().getId(),
                s.getOwner().getEmail(),
                s.getStoreName(),
                s.getSubdomain(),
                s.getAddress(),
                s.isOpen()
        );
    }
}


