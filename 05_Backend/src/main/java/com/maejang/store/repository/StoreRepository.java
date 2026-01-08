package com.maejang.store.repository;

import com.maejang.store.domain.Store;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StoreRepository extends JpaRepository<Store, Long> {
    List<Store> findByOwnerId(Long ownerId);
    Optional<Store> findFirstByOwnerId(Long ownerId);
    boolean existsByOwnerId(Long ownerId);
    
    // 서브도메인으로 매장 조회
    Optional<Store> findBySubdomain(String subdomain);
    
    // 서브도메인 중복 확인 (전체)
    boolean existsBySubdomain(String subdomain);
    
    // 서브도메인 중복 확인 (활성화된 것만, deprecated 제외)
    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END FROM Store s WHERE s.subdomain = :subdomain AND s.subdomain NOT LIKE '%deprecated%'")
    boolean existsBySubdomainExcludingDeprecated(@Param("subdomain") String subdomain);
    
    // Admin용: Owner 정보 함께 조회 (Lazy Loading 문제 해결, owner가 null일 수도 있음)
    @Query("SELECT s FROM Store s LEFT JOIN FETCH s.owner")
    List<Store> findAllWithOwner();
}


