package com.maejang.store.dto.response;

import com.maejang.store.domain.Store;
import java.time.LocalTime;

public record StoreResponse(
        Long storeId,
        Long ownerId,
        String storeName,
        String subdomain,
        String address,
        String description,
        String picture,
        LocalTime openTime,
        LocalTime closeTime,
        boolean isOpen,
        Double latitude,
        Double longitude,
        Double deliveryRadius
) {
    public static StoreResponse from(Store s) {
        return new StoreResponse(
                s.getId(),
                s.getOwner() != null ? s.getOwner().getId() : null,
                s.getStoreName(),
                s.getSubdomain(),
                s.getAddress(),
                s.getDescription(),
                s.getPicture(),
                s.getOpenTime(),
                s.getCloseTime(),
                s.isOpen(),
                s.getLatitude(),
                s.getLongitude(),
                s.getDeliveryRadius()
        );
    }
}


