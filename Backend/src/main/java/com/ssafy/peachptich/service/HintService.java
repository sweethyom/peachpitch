package com.ssafy.peachptich.service;

import com.ssafy.peachptich.dto.response.HintResponseDto;

import java.util.List;

public interface HintService {
    List<HintResponseDto> getHints(Long keywordId);
}
