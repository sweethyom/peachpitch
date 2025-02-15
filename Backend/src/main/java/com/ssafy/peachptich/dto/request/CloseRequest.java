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
    private String sessionEndType; //강제 종료, 에러, 자동 종료
}
