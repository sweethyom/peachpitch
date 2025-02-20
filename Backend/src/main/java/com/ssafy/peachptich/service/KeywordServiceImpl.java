package com.ssafy.peachptich.service;


import com.ssafy.peachptich.dto.response.KeywordResponse;
import com.ssafy.peachptich.entity.Keyword;
import com.ssafy.peachptich.repository.KeywordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class KeywordServiceImpl implements KeywordService {
    private final KeywordRepository keywordRepository;

    @Override
    public List<KeywordResponse> getRandomKeywords() {
        return keywordRepository.findRandomKeyword().stream()
                .map(keyword -> KeywordResponse.builder()
                        .keywordId(keyword.getKeywordId())
                        .keyword(keyword.getKeyword())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public String getKeyword(Long keywordId) {
        Keyword keyword = keywordRepository.findById(keywordId).orElseThrow(()-> new IllegalArgumentException("Keyword not found"));
        return keyword.getKeyword();
    }

    @Override
    public List<KeywordResponse> getFirstKeywords() {
        return keywordRepository.findFirstKeyword().stream()
                .map(keyword -> KeywordResponse.builder()
                        .keywordId(keyword.getKeywordId())
                        .keyword(keyword.getKeyword())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<KeywordResponse> getLastKeywords() {
        return keywordRepository.findLastKeyword().stream()
                .map(keyword -> KeywordResponse.builder()
                        .keywordId(keyword.getKeywordId())
                        .keyword(keyword.getKeyword())
                        .build())
                .collect(Collectors.toList());
    }
}
