package com.ssafy.peachptich.entity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@ToString
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class HaveCoupon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long user_coupon_id;

    private Integer ea;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "item_id")
    private Item item;

   @Builder
    public HaveCoupon(Integer ea, User user, Item item) {
       this.ea = ea;
       this.user = user;
       this.item = item;
   }

}