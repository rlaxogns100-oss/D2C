package com.maejang.store.service;

import com.maejang.global.exception.CustomException;
import com.maejang.global.exception.ErrorCode;
import com.maejang.store.domain.Store;
import com.maejang.store.dto.request.DeliveryAreaUpdateRequest;
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
                .subdomain(req.subdomain()) // 서브도메인 추가
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

    @Transactional
    public void updateDeliveryArea(Long ownerId, DeliveryAreaUpdateRequest req) {
        Store store = readByOwner(ownerId);
        store.updateDeliveryArea(req.latitude(), req.longitude(), req.deliveryRadius());
    }

    @Transactional(readOnly = true)
    public Store readById(Long storeId) {
        return storeRepository.findById(storeId)
                .orElseThrow(() -> new CustomException(ErrorCode.STORE_NOT_FOUND));
    }

    // 서브도메인으로 매장 조회
    public Store findBySubdomain(String subdomain) {
        return storeRepository.findBySubdomain(subdomain)
                .orElseThrow(() -> new CustomException(ErrorCode.STORE_NOT_FOUND));
    }

    // 서브도메인 중복 확인 (비활성화된 것도 포함)
    public boolean existsBySubdomain(String subdomain) {
        return storeRepository.existsBySubdomain(subdomain);
    }
}


