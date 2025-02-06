package com.ssafy.peachptich.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class ChatResponseDto {
    private Long historyId; // 로그인 하지 않은 유저는 null 반환
    private String keyword;
    private List<HintResponseDto> hints;
}