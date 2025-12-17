package com.maejang.auth.service;

import com.maejang.auth.jwt.JwtTokenProvider;
import com.maejang.global.exception.CustomException;
import com.maejang.global.exception.ErrorCode;
import com.maejang.user.domain.User;
import com.maejang.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional(readOnly = true)
    public String loginAndIssueToken(String email, String rawPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new CustomException(ErrorCode.INVALID_USER_INFO);
        }

        return jwtTokenProvider.createAccessToken(user.getId(), user.getEmail(), user.getRole());
    }
}


