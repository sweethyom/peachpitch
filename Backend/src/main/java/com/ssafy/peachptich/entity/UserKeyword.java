package com.ssafy.peachptich.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class UserKeyword {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long selectedId;

    @ManyToOne
    @JoinColumn(name="user_id", nullable=false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "keyword_id", nullable=false)
    private Keyword keyword;

    @ColumnDefault("0")
    private Integer count;

    @Builder
    public UserKeyword(User user, Keyword keyword, Integer count) {
        this.user = user;
        this.keyword = keyword;
        this.count = count;
    }
}
