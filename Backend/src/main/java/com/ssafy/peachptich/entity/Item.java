package com.ssafy.peachptich.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class Item {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long itemId;

    @Column(length = 40, nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ItemType type;

    @Builder
    public Item(String name, Integer price, ItemType type) {
        this.name = name;
        this.price = price;
        this.type = type;
    }

    @Getter
    public enum ItemType {
        FREE_COUPON("무료 이용권"),
        PAID_COUPON("유료 이용권"),
        AVATAR("아바타"),
        BACKGROUND("배경");

        private final String description;

        ItemType(String description) {
            this.description = description;
        }

        public boolean isCoupon() {
            return this == FREE_COUPON || this == PAID_COUPON;
        }
    }
}
