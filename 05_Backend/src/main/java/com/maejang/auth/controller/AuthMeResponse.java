package com.maejang.auth.controller;

import com.maejang.user.domain.UserRole;

public record AuthMeResponse(
        Long userId,
        String email,
        UserRole role
) {
}
