package com.ssafy.peachptich.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Keyword {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long keywordId;

    @Column(length = 30, nullable = false, unique = true)
    private String keyword;

    @ColumnDefault("0")
    private Integer totalCount;

    @Builder
    public Keyword(String keyword, Integer totalCount) {
        this.keyword = keyword;
        this.totalCount = totalCount;
    }
}
