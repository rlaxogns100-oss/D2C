package com.maejang.store.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
import java.time.LocalTime;
import lombok.Builder;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "stores")
public class Store {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "store_id")
    private Long id;

    /**
     * OWNER 유저
     */
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User owner;

    @Column(name = "store_name", nullable = false, length = 200)
    private String storeName;

    @Column(name = "address", nullable = false, length = 500)
    private String address;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "picture", length = 1000)
    private String picture;

    @Column(name = "open_time")
    private LocalTime openTime;

    @Column(name = "close_time")
    private LocalTime closeTime;

    @Column(name = "is_open", nullable = false)
    private boolean open;

    @Builder
    private Store(User owner, String storeName, String address, String description, String picture,
                  LocalTime openTime, LocalTime closeTime, boolean open) {
        this.owner = owner;
        this.storeName = storeName;
        this.address = address;
        this.description = description;
        this.picture = picture;
        this.openTime = openTime;
        this.closeTime = closeTime;
        this.open = open;
    }

    public void setOpen(boolean open) {
        this.open = open;
    }
}
