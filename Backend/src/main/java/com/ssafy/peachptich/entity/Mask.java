package com.ssafy.peachptich.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class Mask {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    //@Column(name="mask_id")
    private Long maskId;

    @Lob
    //@Column(name="image")
    private byte[] image;

    @Builder
    public Mask(byte[] image) {
        this.image = image;
    }
}
