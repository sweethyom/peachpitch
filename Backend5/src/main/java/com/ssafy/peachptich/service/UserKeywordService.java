package com.ssafy.peachptich.service;

import com.ssafy.peachptich.dto.response.RankResponse;

import java.util.List;

public interface UserKeywordService {
    void saveOrUpdate(Long userId, Long keywordId);
    List<RankResponse.KeywordRankResponseItem> rank();
}
