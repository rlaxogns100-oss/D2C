package com.maejang.cart.service;

import com.maejang.cart.domain.CartItem;
import com.maejang.cart.dto.request.CartCreateRequest;
import com.maejang.cart.repository.CartItemRepository;
import com.maejang.global.exception.CustomException;
import com.maejang.global.exception.ErrorCode;
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
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final MenuRepository menuRepository;

    @Transactional
    public Long create(Long userId, CartCreateRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        Menu menu = menuRepository.findById(req.menuId())
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));

        CartItem item = CartItem.builder()
                .user(user)
                .menu(menu)
                .option(req.option())
                .count(req.count())
                .build();

        return cartItemRepository.save(item).getCartItemId();
    }

    @Transactional(readOnly = true)
    public List<CartItem> read(Long userId) {
        return cartItemRepository.findByUserId(userId);
    }

    @Transactional
    public void delete(Long userId, Long cartItemId) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));
        if (!item.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }
        cartItemRepository.delete(item);
    }
}


