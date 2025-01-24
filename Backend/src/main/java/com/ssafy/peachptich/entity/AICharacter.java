package com.ssafy.peachptich.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Table(name="ai_character")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@ToString
public class AICharacter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="ai_id")
    private Long AIId;

    @Lob
    @Column(name="ai_face_1")
    private byte[] AIFace1;

    @Lob
    @Column(name="ai_face_2")
    private byte[] AIFace2;

    @Lob
    @Column(name="ai_face_3")
    private byte[] AIFace3;

    @Builder
    public AICharacter(byte[] AIFace1, byte[] AIFace2, byte[] AIFace3) {
        this.AIFace1 = AIFace1;
        this.AIFace2 = AIFace2;
        this.AIFace3 = AIFace3;
    }

}
