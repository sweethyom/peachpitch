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
public class ReportResponse {
    private Long reportId;
    private Integer chatTime;
    private String pros;
    private String cons;
    private String summary;
    private Long userId;
    private Long historyId;
    private LocalDateTime createdAt;
}
