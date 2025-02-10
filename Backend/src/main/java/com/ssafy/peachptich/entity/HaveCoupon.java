package com.ssafy.peachptich.entity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@ToString
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Table(name="have_coupon")
public class HaveCoupon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "have_coupon_id")
    private Long haveCouponId;

    @Setter
    private Integer ea;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @Setter
    private User user;

    @ManyToOne
    @JoinColumn(name = "item_id", nullable = false)
    @Setter
    private Item item;

    // 무료 쿠폰의 경우 만료 시간 관리
    private LocalDateTime expirationDate;

   @Builder
    public HaveCoupon(Integer ea, User user, Item item, LocalDateTime expirationDate) {
       this.ea = ea;
       this.user = user;
       this.item = item;
       this.expirationDate = expirationDate;

       // 무료 쿠폰인 경우 만료시간 설정
       if (item.getType() == Item.ItemType.FREE_COUPON) {
           this.expirationDate = LocalDateTime.now()
                   .plusDays(1)
                   .withHour(0)
                   .withMinute(0)
                   .withSecond(0);
       }

   }
    // 쿠폰 사용 메서드
    public void useCoupon() {
        if (this.ea <= 0) {
            throw new IllegalStateException("사용 가능한 쿠폰이 없습니다.");
        }
        this.ea--;
    }

    // 쿠폰 추가 메서드
    public void addCoupon(int amount) {
        this.ea += amount;
    }

    // 무료 쿠폰 유효성 검사
    public boolean isValid() {
        if (item.getType() == Item.ItemType.FREE_COUPON) {
            return ea > 0 && LocalDateTime.now().isBefore(expirationDate);
        }
        return ea > 0;
    }

}