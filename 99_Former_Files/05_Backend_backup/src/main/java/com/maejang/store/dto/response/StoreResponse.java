package com.maejang.store.dto.response;

import com.maejang.store.domain.Store;
import java.time.LocalTime;

public record StoreResponse(
        Long storeId,
        Long ownerId,
        String storeName,
        String address,
        String description,
        String picture,
        LocalTime openTime,
        LocalTime closeTime,
        boolean isOpen
) {
    public static StoreResponse from(Store s) {
        return new StoreResponse(
                s.getId(),
                s.getOwner().getId(),
                s.getStoreName(),
                s.getAddress(),
                s.getDescription(),
                s.getPicture(),
                s.getOpenTime(),
                s.getCloseTime(),
                s.isOpen()
        );
    }
}


