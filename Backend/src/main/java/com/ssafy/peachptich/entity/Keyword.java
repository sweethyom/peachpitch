package com.ssafy.peachptich.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class Keyword {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long keywordId;

    @Column(length = 30, nullable = false)
    private String keyword;

    private Integer totalCount;

    @Builder
    public Keyword(String keyword, Integer totalCount) {
        this.keyword = keyword;
        this.totalCount = totalCount;
    }
}
