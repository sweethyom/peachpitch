package com.ssafy.peachptich.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
@AllArgsConstructor
public class FeedbackRequestDto {
    private Long historyId;
    private String feedback;
}
