package com.ssafy.peachptich.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class SpeakingHabitsResponse {
    private Long wordId;
    private String word;
    private Integer count;
}
