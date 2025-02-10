package com.ssafy.peachptich.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@ToString
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class Background {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    //@Column(name="background_id")
    private Long backgroundId;

    private String image;

    @Builder
    public Background(String image) {
        this.image = image;
    }
}
