package com.ssafy.peachptich.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class RankResponse {
    private List <KeywordRankResponseItem> rank;

    @Getter
    @Builder
    public static class KeywordRankResponseItem {
        private String keyword;
        private int count;
    }
}
