package com.ssafy.peachptich.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
//보낸 시각, 내용, 말하는 유저 id를 포함하는 대화내용
public class ChatResponse {
    private String status;
    private LocalDateTime createdAt;
    private String content;
    private Long userId;
}
