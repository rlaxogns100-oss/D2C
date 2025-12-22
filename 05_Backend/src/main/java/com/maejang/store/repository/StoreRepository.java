package com.maejang.store.repository;

import com.maejang.store.domain.Store;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StoreRepository extends JpaRepository<Store, Long> {
    List<Store> findByOwnerId(Long ownerId);
    Optional<Store> findFirstByOwnerId(Long ownerId);
    boolean existsByOwnerId(Long ownerId);
    
    // 서브도메인으로 매장 조회
    Optional<Store> findBySubdomain(String subdomain);
    
    // 서브도메인 중복 확인
    boolean existsBySubdomain(String subdomain);
}


