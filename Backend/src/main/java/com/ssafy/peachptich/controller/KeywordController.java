package com.ssafy.peachptich.controller;


import com.ssafy.peachptich.dto.response.KeywordListResponseDto;
import com.ssafy.peachptich.dto.response.KeywordResponseDto;
import com.ssafy.peachptich.dto.response.ResponseDto;
import com.ssafy.peachptich.service.KeywordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
    public ResponseEntity<ResponseDto<KeywordListResponseDto>> addKeyword() {
        List<KeywordResponseDto> keywords = keywordService.getRandomKeywords();
        KeywordListResponseDto responseDto = KeywordListResponseDto.builder()
                .keywords(keywords)
                .build();
        return ResponseEntity.ok(ResponseDto.of(
                "Keyword added successfully",
                responseDto
        ));
    }


}
