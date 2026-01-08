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
import org.springframework.transaction.annotation.Transactional;
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
    @Transactional(readOnly = true)
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

        // 유저 확인 (선택사항)
        User owner = null;
        if (req.userId() != null) {
            owner = userRepository.findById(req.userId())
                    .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));
        }

        // 서브도메인 중복 확인 (비활성화된 것도 포함)
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

    @Operation(summary = "매장 활성화", description = "매장의 서브도메인에서 -deprecated를 제거합니다.")
    @PostMapping("/store/{storeId}/activate")
    public ResponseEntity<JSONResponse<Void>> activateStore(
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
        if (currentSubdomain != null && currentSubdomain.contains("-deprecated")) {
            String newSubdomain = currentSubdomain.replace("-deprecated", "");
            
            // 활성화할 서브도메인이 이미 사용 중인지 확인 (비활성화된 것 제외)
            if (storeRepository.existsBySubdomainExcludingDeprecated(newSubdomain)) {
                return ResponseEntity.badRequest()
                        .body(JSONResponse.error(HttpStatus.BAD_REQUEST, "해당 서브도메인은 이미 다른 매장에서 사용 중입니다."));
            }
            
            store.setSubdomain(newSubdomain);
            storeRepository.save(store);
        }

        return ResponseEntity.ok(JSONResponse.success(null));
    }

    @Operation(summary = "전체 유저 조회", description = "모든 유저 목록을 조회합니다.")
    @GetMapping("/users/all")
    @Transactional(readOnly = true)
    public ResponseEntity<JSONResponse<List<AdminUserResponse>>> getAllUsers(
            @RequestHeader(value = "X-Admin-Password", required = false) String password
    ) {
        if (!validatePassword(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(JSONResponse.error(HttpStatus.UNAUTHORIZED, "관리자 인증 실패"));
        }

        List<User> users = userRepository.findAll();
        List<AdminUserResponse> response = users.stream()
                .map(AdminUserResponse::from)
                .collect(Collectors.toList());

        return ResponseEntity.ok(JSONResponse.success(response));
    }

    @Operation(summary = "매장 정보 수정", description = "매장 정보를 수정합니다.")
    @PutMapping("/store/{storeId}/update")
    @Transactional
    public ResponseEntity<JSONResponse<Void>> updateStore(
            @RequestHeader(value = "X-Admin-Password", required = false) String password,
            @PathVariable Long storeId,
            @Valid @RequestBody AdminStoreCreateRequest req
    ) {
        if (!validatePassword(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(JSONResponse.error(HttpStatus.UNAUTHORIZED, "관리자 인증 실패"));
        }

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("매장을 찾을 수 없습니다."));

        // 서브도메인이 변경되었고 중복인지 확인
        if (req.subdomain() != null && !req.subdomain().equals(store.getSubdomain())) {
            if (storeRepository.existsBySubdomain(req.subdomain())) {
                return ResponseEntity.badRequest()
                        .body(JSONResponse.error(HttpStatus.BAD_REQUEST, "이미 사용 중인 서브도메인입니다."));
            }
            store.setSubdomain(req.subdomain());
        }

        // 점주 변경 (선택사항)
        if (req.userId() != null) {
            User newOwner = userRepository.findById(req.userId())
                    .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));
            store.setOwner(newOwner);
        }

        // 매장 정보 업데이트
        store.setStoreName(req.storeName());
        store.setAddress(req.address());
        if (req.description() != null) {
            store.setDescription(req.description());
        }

        storeRepository.save(store);

        return ResponseEntity.ok(JSONResponse.success(null));
    }

    @Operation(summary = "매장 완전 삭제", description = "매장을 DB에서 완전히 삭제합니다.")
    @DeleteMapping("/store/{storeId}/delete")
    @Transactional
    public ResponseEntity<JSONResponse<Void>> deleteStore(
            @RequestHeader(value = "X-Admin-Password", required = false) String password,
            @PathVariable Long storeId
    ) {
        if (!validatePassword(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(JSONResponse.error(HttpStatus.UNAUTHORIZED, "관리자 인증 실패"));
        }

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("매장을 찾을 수 없습니다."));

        storeRepository.delete(store);

        return ResponseEntity.ok(JSONResponse.success(null));
    }
}


