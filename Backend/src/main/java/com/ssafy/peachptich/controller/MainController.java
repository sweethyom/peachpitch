package com.ssafy.peachptich.controller;

import com.ssafy.peachptich.dto.CustomUserDetails;
import com.ssafy.peachptich.dto.response.RankResponse;
import com.ssafy.peachptich.dto.response.ResponseDto;
import com.ssafy.peachptich.entity.User;
import com.ssafy.peachptich.service.UserKeywordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
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
@Tag(name = "MainController", description = "메인 화면 관련 컨트롤러")
public class MainController {
    private final UserKeywordService userKeywordService;

    @GetMapping("/api/main")
    @Operation(summary = "메인 페이지", description = "메인 페이지를 로드합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "성공적으로 확인됨")
    })
    public ResponseEntity<Map<String, Object>> mainP(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Map<String, Object> response = new HashMap<>();
        System.out.println("MainController 입성");
        System.out.println(userDetails);

        if (userDetails != null) {
            // 인증된 사용자가 있는 경우
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
    @Operation(summary = "메인 페이지 랭킹 확인", description = "메인 페이지 랭킹을 확인합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "성공적으로 확인됨")
    })
    public ResponseEntity<ResponseDto<RankResponse>> getRank() {
        List<RankResponse.KeywordRankResponseItem> rank = userKeywordService.rank();
        return ResponseEntity.ok().
                body(ResponseDto.<RankResponse>builder()
                        .message("Rank successfully")
                        .data(RankResponse.builder().rank(rank).build())
                        .build());
    }
}
