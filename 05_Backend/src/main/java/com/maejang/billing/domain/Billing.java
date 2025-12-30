package com.maejang.billing.domain;

import com.maejang.user.domain.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "billing")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Billing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String billingKey;

    @Column(nullable = false)
    private String customerKey;

    @Column
    private String cardCompany;

    @Column
    private String cardNumber;

    @Column
    private String cardType;

    @Column
    private String ownerType;

    @Column
    private LocalDateTime createdAt;

    @Column
    private Boolean isDefault;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (isDefault == null) {
            isDefault = false;
        }
    }
}

