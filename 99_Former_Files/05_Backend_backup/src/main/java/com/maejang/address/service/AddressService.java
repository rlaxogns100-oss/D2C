package com.maejang.address.service;

import com.maejang.address.dto.request.AddressCreateRequest;
import com.maejang.address.dto.request.AddressUpdateRequest;
import com.maejang.address.domain.Address;
import com.maejang.address.repository.AddressRepository;
import com.maejang.global.exception.CustomException;
import com.maejang.global.exception.ErrorCode;
import com.maejang.user.domain.User;
import com.maejang.user.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    @Transactional
    public Long create(Long userId, AddressCreateRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        // 정책: 신규 등록은 무조건 기본주소
        addressRepository.clearDefaultByUserId(user.getId());
        boolean isDefault = true;
        Address address = Address.builder()
                .user(user)
                .name(req.name()) // 집, 회사 ,,
                .address(req.address()) // 주소
                .isDefault(isDefault)
                .build();

        return addressRepository.save(address).getAddressId();
    }

    @Transactional(readOnly = true)
    public List<Address> readByUser(Long userId) {
        return addressRepository.findByUserId(userId);
    }

    @Transactional
    public void update(Long userId, Long addressId, AddressUpdateRequest req) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));

        // 인증 기반: 로그인 유저가 소유자와 다르면 거부
        if (!address.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }

        // 부분 수정: null이면 변경하지 않음
        address.updatePartial(req.name(), req.address());
    }

    @Transactional
    public void delete(Long userId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));
        if (!address.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }
        addressRepository.delete(address);
    }

    /**
     * 기본주소 변경(선택)
     * - 유저당 기본주소는 1개만 유지
     *
     * TODO: JWT 적용 후에는 addressId만 받고, "현재 로그인 유저"와 소유자 검증까지 수행해야 함
     */
    @Transactional
    public void choose(Long userId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));

        if (!address.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }
        addressRepository.clearDefaultByUserId(userId);

        // bulk update 이후에도 확실히 반영되도록 재조회 후 기본주소 설정
        Address target = addressRepository.findById(addressId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));
        target.setDefault(true);
    }
}


