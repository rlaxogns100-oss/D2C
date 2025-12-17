package com.maejang.cart.dto.response;

import com.maejang.cart.domain.CartItem;

public record CartItemResponse(
        Long cartItemId,
        Long menuId,
        String menuName,
        String option,
        int count
) {
    public static CartItemResponse from(CartItem c) {
        return new CartItemResponse(
                c.getCartItemId(),
                c.getMenu().getMenuId(),
                c.getMenu().getMenuName(),
                c.getOption(),
                c.getCount()
        );
    }
}


