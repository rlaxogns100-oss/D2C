package com.maejang.menu.dto.response;

import com.maejang.menu.domain.Menu;

public record MenuResponse(
        Long menuId,
        Long storeId,
        Long ownerId,  // 레거시 호환용
        String menuName,
        String picture,
        int price,
        String description,
        String option,
        String category
) {
    public static MenuResponse from(Menu m) {
        return new MenuResponse(
                m.getMenuId(),
                m.getStore().getId(),
                m.getOwner().getId(),  // 레거시 호환용
                m.getMenuName(),
                m.getPicture(),
                m.getPrice(),
                m.getDescription(),
                m.getOption(),
                m.getCategory()
        );
    }
}


