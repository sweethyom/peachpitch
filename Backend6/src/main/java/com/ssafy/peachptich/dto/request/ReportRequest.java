package com.ssafy.peachptich.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ReportRequest {
    private Long userId;
    private Long reportId;
}
