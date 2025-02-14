package com.ssafy.peachptich.controller;

import com.ssafy.peachptich.dto.CustomUserDetails;
import com.ssafy.peachptich.dto.response.RankResponse;
import com.ssafy.peachptich.dto.response.ResponseDto;
import com.ssafy.peachptich.entity.User;
import com.ssafy.peachptich.service.UserKeywordService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@Slf4j
public class MainController {
    private final UserKeywordService userKeywordService;

    @GetMapping("/api/main")
    public ResponseEntity<Map<String, Object>> mainP(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Map<String, Object> response = new HashMap<>();
        log.info("MainController 입성");

        if (userDetails != null) {
            // 인증된 사용자가 있는 경우
            log.info(userDetails.getUserEmail());
            response.put("isAuthenticated", true);
            response.put("email", userDetails.getUserEmail());
            response.put("birth", userDetails.getBirth());
            response.put("role", userDetails.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList()));
        } else {
            response.put("isAuthenticated", false);
            response.put("message", "Not authenticated user");
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/main/rank")
    public ResponseEntity<ResponseDto<RankResponse>> getRank() {
        List<RankResponse.KeywordRankResponseItem> rank = userKeywordService.rank();
        return ResponseEntity.ok().
                body(ResponseDto.<RankResponse>builder()
                        .message("Rank successfully")
                        .data(RankResponse.builder().rank(rank).build())
                        .build());
    }
}
