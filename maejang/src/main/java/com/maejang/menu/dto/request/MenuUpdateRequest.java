package com.maejang.menu.dto.request;

public record MenuUpdateRequest(
        // 부분 수정: null이면 변경하지 않음
        String menuName,
        String picture,
        Integer price,
        String description,
        String option
) {
}


