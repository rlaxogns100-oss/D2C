package com.maejang.global.exception;

import com.maejang.global.response.JSONResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.security.access.AccessDeniedException;


@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 도메인 오류, 인증 오류 등 내가 의도한 예외 처리
    @ExceptionHandler(CustomException.class)
    public ResponseEntity<?> handleBussinessException(CustomException e) {
        ErrorCode errorCode = e.getErrorCode();
        return ResponseEntity
                .status(errorCode.getStatus())
                .body(JSONResponse.error(errorCode));
    }

    // dto @valid 실패 시 발생, 가장 흔하게 필요한 필수 핸들러
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {

        String message = e.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(f -> f.getDefaultMessage())
                .orElse("입력값이 올바르지 않습니다.");

        return ResponseEntity
                .badRequest()
                .body(JSONResponse.error(HttpStatus.BAD_REQUEST, message));
    }

    // 로그인 했지만 role 부족할 때 발생 / 권한 거부
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<?> handleAccessDeniedException(AccessDeniedException e) {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(JSONResponse.error(HttpStatus.FORBIDDEN, "권한이 업습니다."));
    }

    // 나머지 전부
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleException(Exception e) {
        log.error("Unhandled exception", e);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(JSONResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "서버 오류가 발생했습니다."));
    }
}
