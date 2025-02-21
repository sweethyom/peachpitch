package com.ssafy.peachptich.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
@AllArgsConstructor
public class AudioChatRequest {
    private Long keywordId;
}