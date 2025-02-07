package com.ssafy.peachptich.service;

import com.ssafy.peachptich.dto.response.HintResponse;

import java.util.List;

public interface HintService {
    List<HintResponse> getHints(Long keywordId);
}
