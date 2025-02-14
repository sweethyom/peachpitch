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
        FREE("무료"),
        PAID("유료");

        private final String description;

        ItemType(String description) {
            this.description = description;
        }

        public boolean isCoupon() {
            return this == FREE || this == PAID;
        }
    }

}
