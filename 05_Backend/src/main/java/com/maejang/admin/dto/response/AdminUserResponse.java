package com.maejang.admin.dto.response;

import com.maejang.user.domain.User;
import com.maejang.user.domain.UserRole;
import java.time.LocalDateTime;

public record AdminUserResponse(
        Long userId,
        String email,
        String name,
        UserRole role,
        LocalDateTime createdAt
) {
    public static AdminUserResponse from(User u) {
        return new AdminUserResponse(
                u.getId(),
                u.getEmail(),
                u.getName(),
                u.getRole(),
                u.getCreatedAt()
        );
    }
}


