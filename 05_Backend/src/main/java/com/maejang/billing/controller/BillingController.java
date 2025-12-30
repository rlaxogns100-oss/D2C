package com.maejang.billing.controller;

import com.maejang.auth.security.CustomUserDetails;
import com.maejang.billing.dto.request.BillingIssueRequest;
import com.maejang.billing.dto.response.BillingResponse;
import com.maejang.billing.service.BillingService;
import com.maejang.global.response.JSONResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/billing")
@RequiredArgsConstructor
@Tag(name = "Billing", description = "카드(빌링) 관리 API")
public class BillingController {

    private final BillingService billingService;

    @PostMapping("/issue")
    @Operation(summary = "빌링키 발급", description = "토스페이먼츠 빌링키를 발급하고 카드를 등록합니다.")
    public ResponseEntity<JSONResponse<Map<String, Object>>> issueBillingKey(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody BillingIssueRequest request
    ) {
        Map<String, Object> result = billingService.issueBillingKey(userDetails.getId(), request);
        return ResponseEntity.ok(JSONResponse.success(result));
    }

    @GetMapping("/cards")
    @Operation(summary = "등록된 카드 목록 조회", description = "사용자가 등록한 카드 목록을 조회합니다.")
    public ResponseEntity<JSONResponse<List<BillingResponse>>> getCards(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<BillingResponse> cards = billingService.getCards(userDetails.getId());
        return ResponseEntity.ok(JSONResponse.success(cards));
    }

    @DeleteMapping("/cards/{billingId}")
    @Operation(summary = "카드 삭제", description = "등록된 카드를 삭제합니다.")
    public ResponseEntity<JSONResponse<Void>> deleteCard(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long billingId
    ) {
        billingService.deleteCard(userDetails.getId(), billingId);
        return ResponseEntity.ok(JSONResponse.success(null));
    }
}

