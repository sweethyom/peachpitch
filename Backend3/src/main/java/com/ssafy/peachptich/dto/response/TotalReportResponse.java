package com.ssafy.peachptich.dto.response;

import com.ssafy.peachptich.entity.ChatHistory;
import com.ssafy.peachptich.entity.SpeakingHabits;
import com.ssafy.peachptich.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class TotalReportResponse {
    private Long totalReportId;
    private Long userId;
    private Integer ansCount;
    private Integer questCount;
    private Integer totalChatTime;
    private List<SpeakingHabitsResponse> speakingHabits;
    private List<ChatReportListResponse> chatReports;
}
