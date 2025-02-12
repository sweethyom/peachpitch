package com.ssafy.peachptich.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
@AllArgsConstructor
public class CloseRequest {
    private Long historyId;
    private String sessionId;
}
