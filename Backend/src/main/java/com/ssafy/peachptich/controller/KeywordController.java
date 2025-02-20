package com.ssafy.peachptich.controller;


import com.ssafy.peachptich.dto.response.KeywordListResponse;
import com.ssafy.peachptich.dto.response.KeywordResponse;
import com.ssafy.peachptich.dto.response.ResponseDto;
import com.ssafy.peachptich.service.KeywordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "KeywordController", description = "키워드 관련 컨트롤러")
public class KeywordController {

    private final KeywordService keywordService;

    /**
     * 랜덤 키워드 15개 반환
     * @return
     */
    /*@GetMapping(value = {"/api/chat/video/keywords/add", "/api/chat/ai/keywords/add"})
    @Operation(summary = "키워드 추가", description = "AI/1:1 대화 키워드를 추가합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "키워드 성공적으로 추가됨")
    })
    public ResponseEntity<ResponseDto<KeywordListResponse>> addKeyword() {
        List<KeywordResponse> keywords = keywordService.getRandomKeywords();
        KeywordListResponse responseDto = KeywordListResponse.builder()
                .keywords(keywords)
                .build();
        return ResponseEntity.ok().body(ResponseDto.<KeywordListResponse>builder().message("Keyword added successfully").data(responseDto).build());
    }*/

    @GetMapping(value = "/api/chat/ai/keywords/add")
    public ResponseEntity<ResponseDto<KeywordListResponse>> addAIKeyword() {
        List<KeywordResponse> keywords = keywordService.getFirstKeywords();
        KeywordListResponse responseDto = KeywordListResponse.builder()
                .keywords(keywords)
                .build();
        return ResponseEntity.ok().body(ResponseDto.<KeywordListResponse>builder().message("Keyword added successfully").data(responseDto).build());
    }

    @GetMapping(value = "/api/chat/video/keywords/add")
    public ResponseEntity<ResponseDto<KeywordListResponse>> addKeywordVideo() {
        List<KeywordResponse> keywords = keywordService.getLastKeywords();
        KeywordListResponse responseDto = KeywordListResponse.builder()
                .keywords(keywords)
                .build();
        return ResponseEntity.ok().body(ResponseDto.<KeywordListResponse>builder().message("Keyword added successfully").data(responseDto).build());

    }


}
