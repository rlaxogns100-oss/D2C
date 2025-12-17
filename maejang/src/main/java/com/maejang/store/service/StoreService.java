package com.maejang.store.service;

import com.maejang.global.exception.CustomException;
import com.maejang.global.exception.ErrorCode;
import com.maejang.store.domain.Store;
import com.maejang.store.dto.request.StoreCreateRequest;
import com.maejang.store.repository.StoreRepository;
import com.maejang.user.domain.User;
import com.maejang.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class StoreService {

    private final StoreRepository storeRepository;
    private final UserRepository userRepository;

    @Transactional
    public Long create(Long ownerId, StoreCreateRequest req) {
        if (storeRepository.existsByOwnerId(ownerId)) {
            throw new CustomException(ErrorCode.DUPLICATE_STORE);
        }

        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        Store store = Store.builder()
                .owner(owner)
                .storeName(req.storeName())
                .address(req.address())
                .description(req.description())
                .picture(req.picture())
                .openTime(req.openTime())
                .closeTime(req.closeTime())
                .open(false)
                .build();

        return storeRepository.save(store).getId();
    }

    @Transactional(readOnly = true)
    public Store readByOwner(Long ownerId) {
        return storeRepository.findFirstByOwnerId(ownerId)
                .orElseThrow(() -> new CustomException(ErrorCode.STORE_NOT_FOUND));
    }

    @Transactional
    public void open(Long ownerId) {
        Store store = readByOwner(ownerId);
        store.setOpen(true);
    }

    @Transactional
    public void close(Long ownerId) {
        Store store = readByOwner(ownerId);
        store.setOpen(false);
    }
}


