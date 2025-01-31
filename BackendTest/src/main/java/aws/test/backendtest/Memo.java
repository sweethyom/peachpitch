package aws.test.backendtest;

import jakarta.persistence.*;
import lombok.*;

// Lombok
@ToString
@Getter
@Setter
@Builder // 객체 생성(@Builder를 이용하기 위해 @AllArgsConstructor와 @NoArgsConstructor를 같이 처리해야 컴파일 에러가 발생하지 않음)
@AllArgsConstructor
@NoArgsConstructor
@Entity // DB의 테이블을 뜻함(Spring Data JPA 에서는 반드시 @Entity 어노테이션을 추가해야 함)
@Table(name = "tbl_memo") // DB 테이블의 이름을 명시(테이블 명과 클래스 명이 동일한 경우 생략 가능)
public class Memo {

    @Id // PK
    @GeneratedValue(strategy = GenerationType.IDENTITY) // PK의 생성 전략: MySQL의 AUTO_INCREMENT를 사용
    private Long id;

    @Column(length = 200, nullable = false) // Column과 반대로 테이블에 컬럼으로 생성되지 않는 필드의 경우엔 @Transient 어노테이션을 적용
    private String text;

}
