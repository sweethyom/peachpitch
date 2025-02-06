package com.ssafy.peachptich.controller;

import com.ssafy.peachptich.dto.response.RankResponseDto;
import com.ssafy.peachptich.dto.response.ResponseDto;
import com.ssafy.peachptich.service.UserKeywordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class RankController {

    private final UserKeywordService userKeywordService;

    @GetMapping("/api/main/rank")
    public ResponseEntity<ResponseDto<RankResponseDto>> getRank() {
        List<RankResponseDto.KeywordRankResponseItem> rank = userKeywordService.rank();
        return ResponseEntity.ok(ResponseDto.of(
                "Rank successfully", RankResponseDto.builder().rank(rank).build()
        ));
    }
}
