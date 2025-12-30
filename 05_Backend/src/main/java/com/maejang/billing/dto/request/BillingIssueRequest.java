package com.maejang.billing.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class BillingIssueRequest {
    private String authKey;
    private String customerKey;
}

