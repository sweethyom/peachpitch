package com.ssafy.peachptich.dto.response;

import com.ssafy.peachptich.entity.ChatHistory;
import com.ssafy.peachptich.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

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
    private List<ChatMessageResponse> chatMessages;
    private LocalDateTime createdAt;
    private Long historyId;
    private String feedback;  // 상대방이 남긴 피드백

    @Getter
    @Builder
    @AllArgsConstructor
    public static class ChatMessageResponse {
        private Long chatId;
        private String content;
        private Long userId;
        private LocalDateTime createdAt;
    }


}
