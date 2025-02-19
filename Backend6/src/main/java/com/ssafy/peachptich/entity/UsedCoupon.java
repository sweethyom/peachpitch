package com.ssafy.peachptich.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Getter
public class UsedCoupon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long couponId;

    @Column(nullable = false)
    private LocalDate usedDate;

    @ManyToOne
    @JoinColumn(name="user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name="item_id")
    private Item item;

    @Builder
    public UsedCoupon(LocalDate usedDate, User user, Item item) {
        this.usedDate = usedDate;
        this.user = user;
        this.item = item;
    }
}