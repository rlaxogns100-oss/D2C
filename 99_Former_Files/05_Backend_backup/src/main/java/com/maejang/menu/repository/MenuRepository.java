package com.maejang.menu.repository;

import com.maejang.menu.domain.Menu;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MenuRepository extends JpaRepository<Menu, Long> {
    List<Menu> findByOwnerId(Long ownerId);
}


