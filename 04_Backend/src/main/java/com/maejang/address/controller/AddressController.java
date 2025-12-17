package com.maejang.address.controller;

import com.maejang.address.dto.request.AddressCreateRequest;
import com.maejang.address.dto.request.AddressUpdateRequest;
import com.maejang.address.dto.response.AddressIdResponse;
import com.maejang.address.dto.response.AddressResponse;
import com.maejang.address.service.AddressService;
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
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/address")
public class AddressController {

    private final AddressService addressService;

    @Operation(summary = "주소 신규 등록", description = "주소를 신규 등록합니다.")
    @PostMapping("/create")
    public ResponseEntity<JSONResponse<AddressIdResponse>> create(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody AddressCreateRequest req
    ) {
        Long addressId = addressService.create(principal.getUserId(), req);
        return ResponseEntity.status(201)
                .body(JSONResponse.success(new AddressIdResponse(addressId, req.name(), req.address())));
    }

    @Operation(summary = "주소 목록 조회", description = "주소 목록을 조회합니다.")
    @GetMapping("/read")
    public ResponseEntity<JSONResponse<List<AddressResponse>>> read(@AuthenticationPrincipal CustomUserDetails principal) {
        List<AddressResponse> result = addressService.readByUser(principal.getUserId()).stream()
                .map(AddressResponse::from)
                .toList();
        return ResponseEntity.ok(JSONResponse.success(result));
    }

    @Operation(summary = "주소 수정", description = "주소를 수정합니다.")
    @PatchMapping("/update/{addressId}")
    public ResponseEntity<JSONResponse<Void>> update(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long addressId,
            @Valid @RequestBody AddressUpdateRequest req
    ) {
        addressService.update(principal.getUserId(), addressId, req);
        return ResponseEntity.ok(JSONResponse.success(null));
    }

    @Operation(summary = "주소 삭제", description = "주소를 삭제합니다.")
    @DeleteMapping("/delete/{addressId}")
    public ResponseEntity<JSONResponse<Void>> delete(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long addressId
    ) {
        addressService.delete(principal.getUserId(), addressId);
        return ResponseEntity.ok(JSONResponse.success(null));
    }

    @Operation(summary = "주소 선택", description = "주소를 선택합니다.")
    @PostMapping("/choose/{addressId}")
    public ResponseEntity<JSONResponse<Void>> choose(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long addressId
    ) {
        addressService.choose(principal.getUserId(), addressId);
        return ResponseEntity.ok(JSONResponse.success(null));
    }
}


