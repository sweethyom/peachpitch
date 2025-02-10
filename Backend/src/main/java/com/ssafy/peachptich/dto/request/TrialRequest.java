package com.ssafy.peachptich.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class TrialRequest {
    private String fingerprint;    // 브라우저 핑거프린트 값
}
