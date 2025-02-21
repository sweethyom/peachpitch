package com.ssafy.peachptich.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="blacklist")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@ToString
public class Blacklist {
    @Id
    @Column(name="blacklist_id", nullable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long blacklistId;

    @Column(name="from_user_id", nullable = false)
    private Long fromUserId;

    @Column(name="to_user_id", nullable = false)
    private Long toUserId;

    @Builder
    public Blacklist(Long fromUserId, Long toUserId){
        this.fromUserId = fromUserId;
        this.toUserId=toUserId;
    }
}