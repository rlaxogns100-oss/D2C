package com.maejang.address.domain;

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

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "addresses")
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "address_id")
    private Long addressId;

    /**
     * CUSTOMER 유저
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "address", nullable = false, length = 500)
    private String address;

    @Column(name = "is_default", nullable = false)
    private boolean isDefault;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Builder
    private Address(User user, String name, String address, boolean isDefault, Double latitude, Double longitude) {
        this.user = user;
        this.name = name;
        this.address = address;
        this.isDefault = isDefault;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    /**
     * Lombok/annotation processing 환경에 의존하지 않기 위해 PK getter는 명시적으로 제공합니다.
     */
    public Long getAddressId() {
        return addressId;
    }

    public void update(String name, String address, boolean isDefault, Double latitude, Double longitude) {
        this.name = name;
        this.address = address;
        this.isDefault = isDefault;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public void updateInfo(String name, String address, Double latitude, Double longitude) {
        this.name = name;
        this.address = address;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public void updatePartial(String name, String address, Double latitude, Double longitude) {
        if (name != null) this.name = name;
        if (address != null) this.address = address;
        if (latitude != null) this.latitude = latitude;
        if (longitude != null) this.longitude = longitude;
    }

    public void setDefault(boolean isDefault) {
        this.isDefault = isDefault;
    }

}


