package com.maejang.billing.service;

import com.maejang.billing.domain.Billing;
import com.maejang.billing.dto.request.BillingIssueRequest;
import com.maejang.billing.dto.response.BillingResponse;
import com.maejang.billing.repository.BillingRepository;
import com.maejang.global.exception.CustomException;
import com.maejang.global.exception.ErrorCode;
import com.maejang.user.domain.User;
import com.maejang.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BillingService {

    private final BillingRepository billingRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    // 토스페이먼츠 시크릿 키 (ZeroTyping 테스트 키)
    @Value("${toss.secret-key:test_sk_LlDJaYngro9gNQd5zNyN3ezGdRpX}")
    private String tossSecretKey;

    /**
     * 빌링키 발급 (토스페이먼츠 API 호출)
     */
    public Map<String, Object> issueBillingKey(Long userId, BillingIssueRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        // 토스페이먼츠 빌링키 발급 API 호출
        String url = "https://api.tosspayments.com/v1/billing/authorizations/issue";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        // Basic Auth: secretKey를 Base64 인코딩
        String auth = tossSecretKey + ":";
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes(StandardCharsets.UTF_8));
        headers.set("Authorization", "Basic " + encodedAuth);

        Map<String, String> body = new HashMap<>();
        body.put("authKey", request.getAuthKey());
        body.put("customerKey", request.getCustomerKey());

        HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> tossResponse = response.getBody();
                
                // 카드 정보 추출
                Map<String, Object> card = (Map<String, Object>) tossResponse.get("card");
                String billingKey = (String) tossResponse.get("billingKey");
                String customerKey = (String) tossResponse.get("customerKey");

                // DB에 저장
                Billing billing = Billing.builder()
                        .user(user)
                        .billingKey(billingKey)
                        .customerKey(customerKey)
                        .cardCompany(card != null ? (String) card.get("issuerCode") : null)
                        .cardNumber(card != null ? (String) card.get("number") : null)
                        .cardType(card != null ? (String) card.get("cardType") : null)
                        .ownerType(card != null ? (String) card.get("ownerType") : null)
                        .isDefault(billingRepository.findByUserOrderByCreatedAtDesc(user).isEmpty())
                        .build();

                billingRepository.save(billing);

                log.info("빌링키 발급 성공: userId={}, billingKey={}", userId, billingKey);

                // 응답 반환
                Map<String, Object> result = new HashMap<>();
                result.put("billingKey", billingKey);
                result.put("customerKey", customerKey);
                result.put("card", card);
                result.put("billing", BillingResponse.from(billing));
                
                return result;
            } else {
                throw new CustomException(ErrorCode.EXTERNAL_API_ERROR);
            }
        } catch (Exception e) {
            log.error("빌링키 발급 실패: {}", e.getMessage());
            throw new CustomException(ErrorCode.EXTERNAL_API_ERROR);
        }
    }

    /**
     * 등록된 카드 목록 조회
     */
    @Transactional(readOnly = true)
    public List<BillingResponse> getCards(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        return billingRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(BillingResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 카드 삭제
     */
    public void deleteCard(Long userId, Long billingId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        Billing billing = billingRepository.findByIdAndUser(billingId, user)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND));

        billingRepository.delete(billing);
        log.info("카드 삭제 완료: userId={}, billingId={}", userId, billingId);
    }
}

