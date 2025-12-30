package com.maejang.billing.dto.response;

import com.maejang.billing.domain.Billing;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillingResponse {
    private Long id;
    private String billingKey;
    private String customerKey;
    private String cardCompany;
    private String cardNumber;
    private String cardType;
    private LocalDateTime createdAt;
    private Boolean isDefault;

    public static BillingResponse from(Billing billing) {
        return BillingResponse.builder()
                .id(billing.getId())
                .billingKey(billing.getBillingKey())
                .customerKey(billing.getCustomerKey())
                .cardCompany(billing.getCardCompany())
                .cardNumber(billing.getCardNumber())
                .cardType(billing.getCardType())
                .createdAt(billing.getCreatedAt())
                .isDefault(billing.getIsDefault())
                .build();
    }
}

