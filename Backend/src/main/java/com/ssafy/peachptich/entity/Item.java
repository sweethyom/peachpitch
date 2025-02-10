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

    @Builder
    public Item(String name) {
        this.name = name;
    }
}
