package com.ssafy.peachptich.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UserChatRequest {
    private Long historyId;
    private String message;
    private Long userId;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSSSS")
    private String createdAt;

    public UserChatRequest(Long historyId, String message, Long userId) {
        this.historyId = historyId;
        this.message = message;
        this.userId = userId;
        this.createdAt = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSSSS"));
    }

    @Override
    public String toString() {
        return "UserChatRequest{" +
                "historyId=" + historyId +
                ", message='" + message + '\'' +
                ", userId=" + userId +
                ", createdAt='" + createdAt + '\'' +
                '}';
    }
}