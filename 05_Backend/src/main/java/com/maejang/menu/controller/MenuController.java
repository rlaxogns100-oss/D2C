package com.maejang.menu.controller;

import com.maejang.global.response.JSONResponse;
import com.maejang.auth.security.CustomUserDetails;
import com.maejang.menu.dto.request.MenuUpsertRequest;
import com.maejang.menu.dto.request.MenuUpdateRequest;
import com.maejang.menu.dto.response.MenuIdResponse;
import com.maejang.menu.dto.response.MenuResponse;
import com.maejang.menu.service.MenuService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/menu")
public class MenuController {

    private final MenuService menuService;

    @Operation(summary = "메뉴 신규 등록", description = "메뉴를 신규 등록합니다.")
    @PostMapping("/create")
    public ResponseEntity<JSONResponse<MenuIdResponse>> create(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody MenuUpsertRequest req
    ) {
        return ResponseEntity.status(201)
                .body(JSONResponse.success(new MenuIdResponse(menuService.create(principal.getUserId(), req))));
    }

    @Operation(summary = "메뉴 목록 조회", description = "storeId로 메뉴 목록을 조회합니다. (ownerId는 레거시 호환용)")
    @GetMapping("/read")
    public ResponseEntity<JSONResponse<List<MenuResponse>>> read(
            @RequestParam(value = "storeId", required = false) Long storeId,
            @RequestParam(value = "ownerId", required = false) Long ownerId
    ) {
        List<MenuResponse> result;
        
        // storeId 우선, 없으면 ownerId 사용 (레거시 호환)
        if (storeId != null) {
            result = menuService.readByStoreId(storeId).stream()
                    .map(MenuResponse::from)
                    .toList();
        } else {
            result = menuService.read(ownerId).stream()
                    .map(MenuResponse::from)
                    .toList();
        }
        
        return ResponseEntity.ok(JSONResponse.success(result));
    }

    @Operation(summary = "메뉴 수정", description = "메뉴를 수정합니다.")
    @PatchMapping("/update/{menuId}")
    public ResponseEntity<JSONResponse<Void>> update(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long menuId,
            @Valid @RequestBody MenuUpdateRequest req
    ) {
        menuService.update(principal.getUserId(), menuId, req);
        return ResponseEntity.ok(JSONResponse.success(null));
    }

    @Operation(summary = "메뉴 삭제", description = "메뉴를 삭제합니다.")
    @DeleteMapping("/delete/{menuId}")
    public ResponseEntity<JSONResponse<Void>> delete(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long menuId
    ) {
        menuService.delete(principal.getUserId(), menuId);
        return ResponseEntity.ok(JSONResponse.success(null));
    }
}


