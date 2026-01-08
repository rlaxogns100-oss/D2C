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
     * OWNER 유저 (선택사항)
     */
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    private User owner;

    @Column(name = "store_name", nullable = false, length = 200)
    private String storeName;

    @Column(name = "address", nullable = false, length = 500)
    private String address;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "picture", columnDefinition = "LONGTEXT")
    private String picture;

    @Column(name = "open_time")
    private LocalTime openTime;

    @Column(name = "close_time")
    private LocalTime closeTime;

    @Column(name = "is_open", nullable = false)
    private boolean open;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "delivery_radius")
    private Double deliveryRadius; // 배달 반경 (km)

    @Column(name = "subdomain", unique = true, length = 50)
    private String subdomain; // 서브도메인 (예: pizzaschool)

    @Builder
    private Store(User owner, String storeName, String address, String description, String picture,
                  LocalTime openTime, LocalTime closeTime, boolean open, Double latitude, Double longitude, Double deliveryRadius, String subdomain) {
        this.owner = owner;
        this.storeName = storeName;
        this.address = address;
        this.description = description;
        this.picture = picture;
        this.openTime = openTime;
        this.closeTime = closeTime;
        this.open = open;
        this.latitude = latitude;
        this.longitude = longitude;
        this.deliveryRadius = deliveryRadius;
        this.subdomain = subdomain;
    }

    public void setOpen(boolean open) {
        this.open = open;
    }

    public void updateDeliveryArea(Double latitude, Double longitude, Double deliveryRadius) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.deliveryRadius = deliveryRadius;
    }

    public void setSubdomain(String subdomain) {
        this.subdomain = subdomain;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public void setStoreName(String storeName) {
        this.storeName = storeName;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
