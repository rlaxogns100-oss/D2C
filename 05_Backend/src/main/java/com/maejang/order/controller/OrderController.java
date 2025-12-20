package com.maejang.order.controller;

import com.maejang.global.response.JSONResponse;
import com.maejang.order.domain.Order;
import com.maejang.order.dto.request.OrderCreateRequest;
import com.maejang.order.dto.response.OrderIdResponse;
import com.maejang.order.service.OrderService;
import com.maejang.auth.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/order")
public class OrderController {

    private final OrderService orderService;

    @Operation(summary = "주문하기", description = "주문을 생성합니다.")
    @PostMapping("/create")
    public ResponseEntity<JSONResponse<OrderIdResponse>> create(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody OrderCreateRequest req
    ) {
        Long id = orderService.create(principal.getUserId(), req);
        return ResponseEntity.status(201).body(JSONResponse.success(new OrderIdResponse(id)));
    }

    @Operation(summary = "주문 확인(1건)", description = "주문 1건을 조회합니다.")
    @GetMapping("/read")
    public ResponseEntity<JSONResponse<Order>> read(@RequestParam("orderId") Long orderId) {
        return ResponseEntity.ok(JSONResponse.success(orderService.read(orderId)));
    }

    @Operation(summary = "과거 주문 내역", description = "사용자의 주문 내역을 조회합니다.")
    @GetMapping("/history")
    public ResponseEntity<JSONResponse<List<Order>>> history(@AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(JSONResponse.success(orderService.history(principal.getUserId())));
    }

    @Operation(summary = "주문취소", description = "고객이 주문을 취소합니다.")
    @DeleteMapping("/delete")
    public ResponseEntity<JSONResponse<Void>> cancel(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestParam("orderId") Long orderId
    ) {
        orderService.cancelByCustomer(principal.getUserId(), orderId);
        return ResponseEntity.ok(JSONResponse.success(null));
    }

    @Operation(summary = "사장 주문조회", description = "사장의 가게에 들어온 주문 목록을 조회합니다.")
    @GetMapping("/check")
    public ResponseEntity<JSONResponse<List<Order>>> check(@AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(JSONResponse.success(orderService.checkByOwner(principal.getUserId())));
    }

    @Operation(summary = "주문수락", description = "사장이 주문을 수락합니다.")
    @PostMapping("/ok")
    public ResponseEntity<JSONResponse<Void>> ok(@RequestParam("orderId") Long orderId) {
        orderService.acceptByOwner(orderId);
        return ResponseEntity.ok(JSONResponse.success(null));
    }

    @Operation(summary = "주문거절", description = "사장이 주문을 거절합니다.")
    @PostMapping("/cancel")
    public ResponseEntity<JSONResponse<Void>> reject(@RequestParam("orderId") Long orderId) {
        orderService.rejectByOwner(orderId);
        return ResponseEntity.ok(JSONResponse.success(null));
    }

    @Operation(summary = "조리완료(배달시작)", description = "사장이 조리를 완료하고 배달을 시작합니다.")
    @PostMapping("/complete")
    public ResponseEntity<JSONResponse<Void>> complete(@RequestParam("orderId") Long orderId) {
        orderService.completeByOwner(orderId);
        return ResponseEntity.ok(JSONResponse.success(null));
    }

    @Operation(summary = "배달완료", description = "사장이 배달을 완료 처리합니다.")
    @PostMapping("/deliver")
    public ResponseEntity<JSONResponse<Void>> deliver(@RequestParam("orderId") Long orderId) {
        orderService.deliverByOwner(orderId);
        return ResponseEntity.ok(JSONResponse.success(null));
    }
}


