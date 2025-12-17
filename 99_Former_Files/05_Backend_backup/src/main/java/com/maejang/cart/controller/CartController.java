package com.maejang.cart.controller;

import com.maejang.cart.dto.request.CartCreateRequest;
import com.maejang.cart.dto.response.CartItemIdResponse;
import com.maejang.cart.dto.response.CartItemResponse;
import com.maejang.cart.service.CartService;
import com.maejang.auth.security.CustomUserDetails;
import com.maejang.global.response.JSONResponse;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/cart")
public class CartController {

    private final CartService cartService;

    @Operation(summary = "장바구니 등록", description = "장바구니에 메뉴를 추가합니다.")
    @PostMapping("/create")
    public ResponseEntity<JSONResponse<CartItemIdResponse>> create(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody CartCreateRequest req
    ) {
        Long id = cartService.create(principal.getUserId(), req);
        return ResponseEntity.status(201).body(JSONResponse.success(new CartItemIdResponse(id)));
    }

    @Operation(summary = "장바구니 조회", description = "사용자의 장바구니 목록을 조회합니다.")
    @GetMapping("/read")
    public ResponseEntity<JSONResponse<List<CartItemResponse>>> read(@AuthenticationPrincipal CustomUserDetails principal) {
        List<CartItemResponse> result = cartService.read(principal.getUserId()).stream()
                .map(CartItemResponse::from)
                .toList();
        return ResponseEntity.ok(JSONResponse.success(result));
    }

    @Operation(summary = "장바구니 삭제", description = "장바구니 항목을 삭제합니다.")
    @DeleteMapping("/delete/{cartItemId}")
    public ResponseEntity<JSONResponse<Void>> delete(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long cartItemId
    ) {
        cartService.delete(principal.getUserId(), cartItemId);
        return ResponseEntity.ok(JSONResponse.success(null));
    }
}


