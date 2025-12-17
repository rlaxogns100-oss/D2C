package com.maejang.global.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.maejang.global.exception.ErrorCode;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.http.HttpStatus;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "결과 공통 정보")
public record JSONResponse<T> (
        boolean success,
        String code,
        String message,
        T data
) {

    // 성공
    public static <T> JSONResponse<T> success (T data) {
        return new JSONResponse<>(true, HttpStatus.OK.name(), "success", data);
    }

    // ErrorCode를 활용한 에러 응답 생성
    public static <T> JSONResponse<T> error (ErrorCode errorCode) {
        return new JSONResponse<>(false, errorCode.name(), errorCode.getMessage(), null);
    }

    // 커스텀 메시지와 함께 ErrorCode 사용
    public static <T> JSONResponse<T> error(HttpStatus httpStatus, String message) {
        return new JSONResponse<>(false, httpStatus.name(), message, null);
    }
}
