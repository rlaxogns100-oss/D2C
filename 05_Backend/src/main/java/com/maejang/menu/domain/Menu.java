package com.maejang.menu.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.maejang.store.domain.Store;
import com.maejang.user.domain.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Builder;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Where;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "menus")
@Where(clause = "is_deleted = false")
public class Menu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "menu_id")
    private Long menuId;

    /**
     * 매장 (메뉴는 매장에 속함)
     */
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    /**
     * OWNER 유저 (레거시 호환용 - 추후 제거 예정)
     */
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User owner;

    @Column(name = "menu_name", nullable = false, length = 200)
    private String menuName;

    @Column(name = "picture", length = 1000)
    private String picture;

    @Column(name = "price", nullable = false)
    private int price;

    @Column(name = "description", length = 1000)
    private String description;

    /**
     * 예: "국물추가+500,곱빼기+1000" 같은 문자열
     * (추후 테이블 분리 가능)
     */
    // MySQL 예약어 충돌 방지
    @Column(name = "menu_option", length = 1000)
    private String option;

    @Column(name = "category", length = 50)
    private String category;

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    @Builder
    private Menu(Store store, User owner, String menuName, String picture, int price, String description, String option, String category) {
        this.store = store;
        this.owner = owner;
        this.menuName = menuName;
        this.picture = picture;
        this.price = price;
        this.description = description;
        this.option = option;
        this.category = category;
        this.isDeleted = false;
    }

    public void update(String menuName, String picture, int price, String description, String option, String category) {
        this.menuName = menuName;
        this.picture = picture;
        this.price = price;
        this.description = description;
        this.option = option;
        this.category = category;
    }

    public void updatePartial(String menuName, String picture, Integer price, String description, String option, String category) {
        if (menuName != null) this.menuName = menuName;
        if (picture != null) this.picture = picture;
        if (price != null) this.price = price;
        if (description != null) this.description = description;
        if (option != null) this.option = option;
        if (category != null) this.category = category;
    }

    public void delete() {
        this.isDeleted = true;
    }
}
