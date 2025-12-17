package com.maejang.address.repository;

import com.maejang.address.domain.Address;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByUserId(Long userId);
    List<Address> findByUserIdAndIsDefaultTrue(Long userId);

    // clearAutomatically=true면 영속성 컨텍스트가 비워져서, 이후 엔티티 변경이 반영되지 않을 수 있음
    @Modifying(flushAutomatically = true)
    @Query("update Address a set a.isDefault = false where a.user.id = :userId and a.isDefault = true")
    int clearDefaultByUserId(@Param("userId") Long userId);
}


