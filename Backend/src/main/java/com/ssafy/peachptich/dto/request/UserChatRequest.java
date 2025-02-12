package com.ssafy.peachptich.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UserChatRequest {
    private Long historyId;
    private String message;
    private Long userId;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSSSS") // LocalDateTime 형식 지정
    private LocalDateTime createdAt;

    public UserChatRequest(Long historyId, String message, Long userId) {
        this.historyId = historyId;
        this.message = message;
        this.userId = userId;
        this.createdAt = LocalDateTime.now();  // createdAt을 서버에서 자동 설정
    }
}

