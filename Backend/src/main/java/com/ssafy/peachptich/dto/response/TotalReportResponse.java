package com.ssafy.peachptich.dto.response;

import com.ssafy.peachptich.entity.ChatHistory;
import com.ssafy.peachptich.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class TotalReportResponse {
    private Long totalReportId;
    private Integer ansCount;
    private Integer questCount;
    private Integer totalChatTime;
}
