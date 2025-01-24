package com.ssafy.peachptich.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Table(name="speaking_habits")
public class SpeakingHabits {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long wordId;

    @Column(length = 100, nullable = false)
    private String word;

    @ColumnDefault("0")
    private Integer count;

    @OneToOne
    @JoinColumn(name="total_report_id", nullable = false)
    private TotalReport totalReport;

    @Builder
    public SpeakingHabits(String word, Integer count, TotalReport totalReport) {
        this.word = word;
        this.count = count;
        this.totalReport = totalReport;
    }
}
