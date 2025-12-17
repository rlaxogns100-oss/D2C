package com.maejang.store.repository;

import com.maejang.store.domain.Store;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StoreRepository extends JpaRepository<Store, Long> {
    List<Store> findByOwnerId(Long ownerId);
    Optional<Store> findFirstByOwnerId(Long ownerId);
    boolean existsByOwnerId(Long ownerId);
}


