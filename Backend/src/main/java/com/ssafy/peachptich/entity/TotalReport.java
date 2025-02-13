package com.ssafy.peachptich.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class TotalReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long totalReportId;

    private Integer totalChatTime;

    //private Integer blankTime;

    private Integer questCount;

    private Integer ansCount;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "totalReport")
    private List<SpeakingHabits> speakingHabits = new ArrayList<>();

    /**
     * 장고에서 생성될 예정, 테스트 용으로 남겨둠
     * @param totalChatTime
     * @param questCount
     * @param ansCount
     */
    @Builder
    public TotalReport(Integer totalChatTime, Integer questCount, Integer ansCount) {
        this.totalChatTime = totalChatTime;
        this.questCount = questCount;
        this.ansCount = ansCount;
    }
}
