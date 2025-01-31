package com.ssafy.peachptich.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Hint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    //@Column(name="hint_id")
    private Long hintId;

    @Column(nullable = false, length = 200, name="hint")
    private String hint;

    @ManyToOne
    @JoinColumn(name = "keyword_id", nullable = false)
    private Keyword keyword;

    @Builder
    public Hint(String hint, Keyword keyword) {
        this.hint = hint;
        this.keyword = keyword;
    }
}
