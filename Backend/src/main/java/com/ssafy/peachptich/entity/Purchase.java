package com.ssafy.peachptich.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class Purchase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long purchaseId;

    @Column(nullable = false)
    private LocalDateTime paymentTime;

    @Column(nullable = false)
    private Integer ea;

    @Column(nullable = false)
    private String method;

    @ManyToOne
    @JoinColumn(name="user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name="item_id", nullable = false)
    private Item item;

    @Builder
    public Purchase(LocalDateTime paymentTime, Integer ea, String method, User user, Item item) {
        this.paymentTime = paymentTime;
        this.ea = ea;
        this.method = method;
        this.user = user;
        this.item = item;
    }

}