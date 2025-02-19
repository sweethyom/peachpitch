package com.ssafy.peachptich.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TrialResponse {
    private boolean canAccess;    // 체험 가능 여부
    private String message;       // 응답 메시지
}
