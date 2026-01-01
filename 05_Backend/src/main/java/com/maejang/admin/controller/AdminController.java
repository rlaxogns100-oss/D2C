package com.maejang.admin.controller;

import com.maejang.admin.dto.request.AdminStoreCreateRequest;
import com.maejang.admin.dto.response.AdminStoreResponse;
import com.maejang.admin.dto.response.AdminUserResponse;
import com.maejang.global.response.JSONResponse;
import com.maejang.store.domain.Store;
import com.maejang.store.dto.response.StoreIdResponse;
import com.maejang.store.repository.StoreRepository;
import com.maejang.user.domain.User;
import com.maejang.user.domain.UserRole;
import com.maejang.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private static final String ADMIN_PASSWORD = "235811";

    private final StoreRepository storeRepository;
    private final UserRepository userRepository;

    /**
     * Admin 비밀번호 검증
     */
    private boolean validatePassword(String password) {
        return ADMIN_PASSWORD.equals(password);
    }

    @Operation(summary = "전체 매장 목록 조회", description = "모든 매장 목록을 조회합니다.")
    @GetMapping("/stores")
    public ResponseEntity<JSONResponse<List<AdminStoreResponse>>> getAllStores(
            @RequestHeader(value = "X-Admin-Password", required = false) String password
    ) {
        if (!validatePassword(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(JSONResponse.error(HttpStatus.UNAUTHORIZED, "관리자 인증 실패"));
        }

        List<Store> stores = storeRepository.findAllWithOwner();
        List<AdminStoreResponse> response = stores.stream()
                .map(AdminStoreResponse::from)
                .collect(Collectors.toList());

        return ResponseEntity.ok(JSONResponse.success(response));
    }

    @Operation(summary = "매장 없는 OWNER 유저 조회", description = "매장이 연결되지 않은 OWNER 유저 목록을 조회합니다.")
    @GetMapping("/users/without-store")
    public ResponseEntity<JSONResponse<List<AdminUserResponse>>> getUsersWithoutStore(
            @RequestHeader(value = "X-Admin-Password", required = false) String password
    ) {
        if (!validatePassword(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(JSONResponse.error(HttpStatus.UNAUTHORIZED, "관리자 인증 실패"));
        }

        // OWNER role 유저 중 매장이 없는 유저
        List<User> owners = userRepository.findByRole(UserRole.OWNER);
        List<Long> ownerIdsWithStore = storeRepository.findAllWithOwner().stream()
                .map(store -> store.getOwner().getId())
                .collect(Collectors.toList());

        List<AdminUserResponse> response = owners.stream()
                .filter(user -> !ownerIdsWithStore.contains(user.getId()))
                .map(AdminUserResponse::from)
                .collect(Collectors.toList());

        return ResponseEntity.ok(JSONResponse.success(response));
    }

    @Operation(summary = "Admin용 매장 생성", description = "관리자가 특정 유저에게 매장을 생성합니다.")
    @PostMapping("/store/create")
    public ResponseEntity<JSONResponse<StoreIdResponse>> createStore(
            @RequestHeader(value = "X-Admin-Password", required = false) String password,
            @Valid @RequestBody AdminStoreCreateRequest req
    ) {
        if (!validatePassword(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(JSONResponse.error(HttpStatus.UNAUTHORIZED, "관리자 인증 실패"));
        }

        // 유저 확인
        User owner = userRepository.findById(req.userId())
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));

        // 서브도메인 중복 확인
        if (req.subdomain() != null && storeRepository.existsBySubdomain(req.subdomain())) {
            return ResponseEntity.badRequest()
                    .body(JSONResponse.error(HttpStatus.BAD_REQUEST, "이미 사용 중인 서브도메인입니다."));
        }

        // 매장 생성
        Store store = Store.builder()
                .owner(owner)
                .storeName(req.storeName())
                .subdomain(req.subdomain())
                .address(req.address())
                .description(req.description())
                .open(false)
                .build();

        Store saved = storeRepository.save(store);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(JSONResponse.success(new StoreIdResponse(saved.getId())));
    }

    @Operation(summary = "매장 비활성화", description = "매장의 서브도메인에 -deprecated를 추가합니다.")
    @PostMapping("/store/{storeId}/deprecate")
    public ResponseEntity<JSONResponse<Void>> deprecateStore(
            @RequestHeader(value = "X-Admin-Password", required = false) String password,
            @PathVariable Long storeId
    ) {
        if (!validatePassword(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(JSONResponse.error(HttpStatus.UNAUTHORIZED, "관리자 인증 실패"));
        }

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("매장을 찾을 수 없습니다."));

        String currentSubdomain = store.getSubdomain();
        if (currentSubdomain != null && !currentSubdomain.contains("deprecated")) {
            store.setSubdomain(currentSubdomain + "-deprecated");
            storeRepository.save(store);
        }

        return ResponseEntity.ok(JSONResponse.success(null));
    }
}


