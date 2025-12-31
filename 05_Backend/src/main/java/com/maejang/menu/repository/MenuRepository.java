package com.maejang.menu.repository;

import com.maejang.menu.domain.Menu;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MenuRepository extends JpaRepository<Menu, Long> {
    /**
     * 매장 ID로 메뉴 목록 조회 (신규)
     */
    List<Menu> findByStoreId(Long storeId);
    
    /**
     * 점주 ID로 메뉴 목록 조회 (레거시 호환용 - 추후 제거 예정)
     */
    List<Menu> findByOwnerId(Long ownerId);
}


