package com.maejang.billing.repository;

import com.maejang.billing.domain.Billing;
import com.maejang.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BillingRepository extends JpaRepository<Billing, Long> {
    List<Billing> findByUserOrderByCreatedAtDesc(User user);
    Optional<Billing> findByIdAndUser(Long id, User user);
    Optional<Billing> findByCustomerKey(String customerKey);
    boolean existsByBillingKey(String billingKey);
}

