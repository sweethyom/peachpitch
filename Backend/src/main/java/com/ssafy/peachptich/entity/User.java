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
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Setter
    @Column(unique = true, length = 40, nullable = false)
    private String email;

    @Setter
    @Column(length = 1000, nullable = false)
    private String password;

    @Column(length = 40)
    private String snsId;

    @Column(length = 100)
    private String snsType;

    @Setter
    private LocalDate birth;

    @ColumnDefault("true")
    @Column(columnDefinition = "TINYINT(1)")
    @Setter
    private Boolean status;

    @Setter
    private String role;

    @Builder
    public User(String email, String password, LocalDate birth) {
        this.email = email;
        this.birth = birth;
        this.password = password;
    }

    /*
        ## password와 role 필드에 @Setter를 적용한 이유

        - 어차피 setPassword(), setRole() 메소드를 public으로 따로 생성해줄 것이라면
        @Setter를 사용하여 자동으로 set 메소드가 생성되도록 하는 것과 별반 차이가 없음
        -> 코드 간소화를 위해 @Setter를 적용함
     */

}
