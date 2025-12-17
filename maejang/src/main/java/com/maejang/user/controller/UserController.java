package com.maejang.user.controller;

import com.maejang.global.response.JSONResponse;
import com.maejang.user.dto.request.UserLoginRequest;
import com.maejang.user.dto.request.UserSignupRequest;
import com.maejang.user.dto.request.EmailDuplicateRequest;
import com.maejang.user.dto.response.EmailDuplicateResponse;
import com.maejang.user.dto.response.UserIdResponse;
import com.maejang.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    @PostMapping("/email/duplicate")
    public ResponseEntity<JSONResponse<EmailDuplicateResponse>> emailDuplicate(@Valid @RequestBody EmailDuplicateRequest req) {
        boolean duplicated = userService.isEmailDuplicate(req.email());
        return ResponseEntity.ok(JSONResponse.success(new EmailDuplicateResponse(duplicated)));
    }

    /**
     * NOTE: 스펙에 /sing_in 으로 되어있어서 일단 그대로 제공
     */
    @PostMapping({"/sing_in", "/sign_in"})
    public ResponseEntity<JSONResponse<UserIdResponse>> signup(@Valid @RequestBody UserSignupRequest req) {
        Long userId = userService.signup(req);
        return ResponseEntity.status(201).body(JSONResponse.success(new UserIdResponse(userId)));
    }

    @PostMapping("/login")
    public ResponseEntity<JSONResponse<UserIdResponse>> login(@Valid @RequestBody UserLoginRequest req) {
        // NOTE: JWT 쿠키 로그인은 /api/v1/auth/login 사용
        Long userId = userService.login(req);
        return ResponseEntity.ok(JSONResponse.success(new UserIdResponse(userId)));
    }

    /**
     * TODO: JWT/세션 도입 시 실제 로그아웃 처리로 변경
     */
    @PostMapping("/logout")
    public ResponseEntity<JSONResponse<Void>> logout() {
        // NOTE: JWT 쿠키 로그아웃은 /api/v1/auth/logout 사용
        return ResponseEntity.ok(JSONResponse.success(null));
    }
}


