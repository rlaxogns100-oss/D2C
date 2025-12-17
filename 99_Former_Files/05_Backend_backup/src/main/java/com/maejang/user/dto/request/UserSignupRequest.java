package com.maejang.user.dto.request;

import com.maejang.user.domain.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UserSignupRequest(
        @Email(message = "이메일 형식이 올바르지 않습니다.")
        @NotBlank(message = "email은 필수입니다.")
        String email,

        @NotBlank(message = "password는 필수입니다.")
        String password,

        @NotNull(message = "role은 필수입니다.")
        UserRole role,

        @NotBlank(message = "name은 필수입니다.")
        String name
) {
}


