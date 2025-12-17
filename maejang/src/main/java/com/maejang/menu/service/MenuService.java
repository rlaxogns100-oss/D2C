package com.maejang.menu.service;

import com.maejang.global.exception.CustomException;
import com.maejang.global.exception.ErrorCode;
import com.maejang.menu.dto.request.MenuUpsertRequest;
import com.maejang.menu.dto.request.MenuUpdateRequest;
import com.maejang.menu.domain.Menu;
import com.maejang.menu.repository.MenuRepository;
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

    @Transactional
    public Long create(Long ownerId, MenuUpsertRequest req) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        Menu menu = Menu.builder()
                .owner(owner)
                .menuName(req.menuName())
                .picture(req.picture())
                .price(req.price())
                .description(req.description())
                .option(req.option())
                .build();
        return menuRepository.save(menu).getMenuId();
    }

    @Transactional(readOnly = true)
    public List<Menu> read(Long ownerId) {
        if (ownerId == null) {
            return menuRepository.findAll();
        }
        return menuRepository.findByOwnerId(ownerId);
    }

    @Transactional
    public void update(Long ownerId, Long menuId, MenuUpdateRequest req) {
        Menu menu = menuRepository.findById(menuId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));

        // 인증 기반: 로그인 ownerId가 소유자와 다르면 거부
        if (!menu.getOwner().getId().equals(ownerId)) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }

        menu.updatePartial(req.menuName(), req.picture(), req.price(), req.description(), req.option());
    }

    @Transactional
    public void delete(Long menuId) {
        menuRepository.deleteById(menuId);
    }
}


