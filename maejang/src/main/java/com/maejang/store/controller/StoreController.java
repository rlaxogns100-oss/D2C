package com.maejang.store.controller;

import com.maejang.global.response.JSONResponse;
import com.maejang.auth.security.CustomUserDetails;
import com.maejang.store.dto.request.StoreCreateRequest;
import com.maejang.store.dto.response.StoreIdResponse;
import com.maejang.store.dto.response.StoreResponse;
import com.maejang.store.service.StoreService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/store")
public class StoreController {

    private final StoreService storeService;

    @Operation(summary = "가게 생성", description = "사장당 1개의 가게를 생성합니다.")
    @PostMapping("/create")
    public ResponseEntity<JSONResponse<StoreIdResponse>> create(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody StoreCreateRequest req
    ) {
        Long storeId = storeService.create(principal.getUserId(), req);
        return ResponseEntity.status(201).body(JSONResponse.success(new StoreIdResponse(storeId)));
    }

    @Operation(summary = "가게 조회", description = "현재 로그인한 사장의 가게를 조회합니다.")
    @GetMapping("/read")
    public ResponseEntity<JSONResponse<StoreResponse>> read(@AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(JSONResponse.success(StoreResponse.from(storeService.readByOwner(principal.getUserId()))));
    }

    @Operation(summary = "가게 오픈", description = "현재 로그인한 사장의 가게를 오픈 처리합니다.")
    @PostMapping("/open")
    public ResponseEntity<JSONResponse<Void>> open(@AuthenticationPrincipal CustomUserDetails principal) {
        storeService.open(principal.getUserId());
        return ResponseEntity.ok(JSONResponse.success(null));
    }

    @Operation(summary = "가게 클로즈", description = "현재 로그인한 사장의 가게를 클로즈 처리합니다.")
    @PostMapping("/close")
    public ResponseEntity<JSONResponse<Void>> close(@AuthenticationPrincipal CustomUserDetails principal) {
        storeService.close(principal.getUserId());
        return ResponseEntity.ok(JSONResponse.success(null));
    }
}


