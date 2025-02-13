package com.ssafy.peachptich.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ChatReportListResponse {
    private Long reportId;
    private String partnerName;
    private String keyword1;
    private String keyword2;
}
