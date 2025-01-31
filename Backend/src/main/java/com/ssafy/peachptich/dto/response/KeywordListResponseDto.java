package com.ssafy.peachptich.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class KeywordListResponseDto {
    private List<KeywordResponseDto> keywords;
}
