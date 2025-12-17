package com.maejang.user.service;

import com.maejang.global.exception.CustomException;
import com.maejang.global.exception.ErrorCode;
import com.maejang.user.dto.request.UserLoginRequest;
import com.maejang.user.dto.request.UserSignupRequest;
import com.maejang.user.domain.User;
import com.maejang.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public boolean isEmailDuplicate(String email) {
        return userRepository.existsByEmail(email);
    }

    @Transactional
    public Long signup(UserSignupRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new CustomException(ErrorCode.DUPLICATE_USER);
        }

        User user = User.builder()
                .email(req.email())
                .password(passwordEncoder.encode(req.password()))
                .role(req.role())
                .name(req.name())
                .build();

        return userRepository.save(user).getId();
    }

    /**
     * TODO: JWT 도입 시 토큰 발급으로 변경
     */
    @Transactional(readOnly = true)
    public Long login(UserLoginRequest req) {
        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        if (!passwordEncoder.matches(req.password(), user.getPassword())) {
            throw new CustomException(ErrorCode.INVALID_USER_INFO);
        }

        return user.getId();
    }
}


