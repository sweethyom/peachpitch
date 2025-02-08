package com.ssafy.peachptich.controller;

import com.ssafy.peachptich.dto.response.RankResponse;
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
    public ResponseEntity<ResponseDto<RankResponse>> getRank() {
        List<RankResponse.KeywordRankResponseItem> rank = userKeywordService.rank();
        return ResponseEntity.ok(new ResponseDto<>(
                "Rank successfully", RankResponse.builder().rank(rank).build()
        ));
    }
}
