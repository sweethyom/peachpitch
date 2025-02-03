package com.ssafy.peachptich.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;

@Builder
@Getter
@AllArgsConstructor
public class AudioChatRequestDto {
    private Long keywordId;
}