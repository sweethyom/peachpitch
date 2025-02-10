package com.ssafy.peachptich.controller;


import com.ssafy.peachptich.dto.response.KeywordListResponse;
import com.ssafy.peachptich.dto.response.KeywordResponse;
import com.ssafy.peachptich.dto.response.ResponseDto;
import com.ssafy.peachptich.service.KeywordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class KeywordController {

    private final KeywordService keywordService;

    /**
     * 랜덤 키워드 15개 반환
     *
     * @return
     */
    @GetMapping(value = {"/api/chat/video/keywords/add", "/api/chat/ai/keywords/add"})
    public ResponseEntity<ResponseDto<KeywordListResponse>> addKeyword() {
        List<KeywordResponse> keywords = keywordService.getRandomKeywords();
        KeywordListResponse responseDto = KeywordListResponse.builder()
                .keywords(keywords)
                .build();
        return ResponseEntity.ok(new ResponseDto<>(
                "Keyword added successfully",
                responseDto
        ));
    }


}
