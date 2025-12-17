package com.maejang.auth.controller;

import com.maejang.auth.jwt.JwtProperties;
import com.maejang.auth.security.CustomUserDetails;
import com.maejang.auth.service.AuthService;
import com.maejang.global.response.JSONResponse;
import com.maejang.user.dto.request.UserLoginRequest;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "내 정보", description = "JWT 쿠키 기반 인증이 정상인지 확인용")
    @PostMapping("/me")
    public ResponseEntity<JSONResponse<AuthMeResponse>> me(@AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(JSONResponse.success(new AuthMeResponse(principal.getUserId(), principal.getUsername())));
    }

    @Operation(summary = "로그인", description = "응답 헤더 Authorization: Bearer <token> 으로 토큰을 내려줍니다. (Swagger에서 복사해서 Authorize에 붙여넣어 사용)")
    @PostMapping("/login")
    public ResponseEntity<JSONResponse<Void>> login(@Valid @RequestBody UserLoginRequest req) {
        String token = authService.loginAndIssueToken(req.email(), req.password());

        ResponseCookie cookie = ResponseCookie.from(JwtProperties.COOKIE_NAME, token)
                .httpOnly(true)
                .secure(false) // 로컬 개발: false, 배포(HTTPS): true
                .path("/")
                .maxAge(JwtProperties.ACCESS_TOKEN_TTL)
                .sameSite("Lax")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(JSONResponse.success(null));
    }

    @Operation(summary = "로그아웃(쿠키 삭제)", description = "ACCESS_TOKEN 쿠키를 만료시킵니다.")
    @PostMapping("/logout")
    public ResponseEntity<JSONResponse<Void>> logout() {
        ResponseCookie cookie = ResponseCookie.from(JwtProperties.COOKIE_NAME, "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(JSONResponse.success(null));
    }
}


