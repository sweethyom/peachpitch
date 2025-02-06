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
    private String orderId;        // partner_order_id 저장용

    @Column(nullable = false)
    private LocalDateTime paymentTime;

    @Column(nullable = false)
    private Integer ea;

    @Column(nullable = false)
    private String method;

    @Column(nullable = false)
    private Integer totalPrice;

    @ManyToOne
    @JoinColumn(name="user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name="item_id", nullable = false)
    private Item item;

    @Builder
    public Purchase(String orderId, LocalDateTime paymentTime, Integer ea, String method, Integer totalPrice, User user, Item item) {
        this.orderId = orderId;
        this.paymentTime = paymentTime;
        this.ea = ea;
        this.method = method;
        this.totalPrice = totalPrice;
        this.user = user;
        this.item = item;
    }

}