package com.maejang.menu.service;

import com.maejang.global.exception.CustomException;
import com.maejang.global.exception.ErrorCode;
import com.maejang.menu.dto.request.MenuUpsertRequest;
import com.maejang.menu.dto.request.MenuUpdateRequest;
import com.maejang.menu.domain.Menu;
import com.maejang.menu.repository.MenuRepository;
import com.maejang.store.domain.Store;
import com.maejang.store.repository.StoreRepository;
import com.maejang.user.domain.User;
import com.maejang.user.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class MenuService {

    private final MenuRepository menuRepository;
    private final UserRepository userRepository;
    private final StoreRepository storeRepository;

    /**
     * 메뉴 생성 - 점주(ownerId)로 매장을 찾아서 메뉴 등록
     */
    @Transactional
    public Long create(Long ownerId, MenuUpsertRequest req) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        
        // 점주의 매장 조회
        Store store = storeRepository.findFirstByOwnerId(ownerId)
                .orElseThrow(() -> new CustomException(ErrorCode.STORE_NOT_FOUND));

        Menu menu = Menu.builder()
                .store(store)
                .owner(owner)
                .menuName(req.menuName())
                .picture(req.picture())
                .price(req.price())
                .description(req.description())
                .option(req.option())
                .category(req.category())
                .build();
        return menuRepository.save(menu).getMenuId();
    }

    /**
     * 메뉴 목록 조회 - storeId 기반 (신규)
     */
    @Transactional(readOnly = true)
    public List<Menu> readByStoreId(Long storeId) {
        if (storeId == null) {
            return menuRepository.findAll();
        }
        return menuRepository.findByStoreId(storeId);
    }

    /**
     * 메뉴 목록 조회 - ownerId 기반 (레거시 호환용)
     */
    @Transactional(readOnly = true)
    public List<Menu> read(Long ownerId) {
        if (ownerId == null) {
            return menuRepository.findAll();
        }
        return menuRepository.findByOwnerId(ownerId);
    }

    /**
     * 메뉴 수정 - 점주가 자신의 매장 메뉴만 수정 가능
     */
    @Transactional
    public void update(Long ownerId, Long menuId, MenuUpdateRequest req) {
        Menu menu = menuRepository.findById(menuId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));

        // 인증 기반: 로그인한 점주가 해당 매장의 주인인지 확인
        if (!menu.getStore().getOwner().getId().equals(ownerId)) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }

        menu.updatePartial(req.menuName(), req.picture(), req.price(), req.description(), req.option(), req.category());
    }

    /**
     * 메뉴 삭제 (soft delete) - 점주가 자신의 매장 메뉴만 삭제 가능
     */
    @Transactional
    public void delete(Long ownerId, Long menuId) {
        Menu menu = menuRepository.findById(menuId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));

        if (!menu.getStore().getOwner().getId().equals(ownerId)) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }

        menu.delete();
    }
}


