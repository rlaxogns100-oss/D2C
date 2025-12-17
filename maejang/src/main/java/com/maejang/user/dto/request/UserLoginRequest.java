package com.maejang.user.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UserLoginRequest(
        @Email(message = "이메일 형식이 올바르지 않습니다.")
        @NotBlank(message = "email은 필수입니다.")
        String email,

        @NotBlank(message = "password는 필수입니다.")
        String password
) {
}


