package com.ssafy.peachptich.entity;

import jakarta.persistence.*;
import lombok.*;
import org.antlr.v4.runtime.misc.NotNull;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Type;

import java.math.BigInteger;
import java.time.LocalDate;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    // @NotNull과 @NotEmpty가 deprecated된 것 같음..
    @Column(unique = true, length = 40, nullable = false)
    private String email;

    @Column(length = 40, nullable = false)
    private String password;

    @Column(length = 40)
    private String snsId;

    @Column(length = 100)
    private String snsType;

    private LocalDate birth;

    @ColumnDefault("1")
    private Boolean status;

    @Builder
    public User(String email, String password, LocalDate birth) {
        this.email = email;
        this.birth = birth;
        this.password = password;
    }

}
