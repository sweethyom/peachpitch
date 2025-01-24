package com.ssafy.peachptich.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class TotalReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long totalReportId;

    private Integer totalChatTime;

    private Integer blankTime;

    private Integer questCount;

    private Integer ansCount;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    /**
     * 장고에서 생성될 예정, 테스트 용으로 남겨둠
     * @param totalChatTime
     * @param blankTime
     * @param questCount
     * @param ansCount
     */
    @Builder
    public TotalReport(Integer totalChatTime, Integer blankTime, Integer questCount, Integer ansCount) {
        this.totalChatTime = totalChatTime;
        this.blankTime = blankTime;
        this.questCount = questCount;
        this.ansCount = ansCount;
    }
}
