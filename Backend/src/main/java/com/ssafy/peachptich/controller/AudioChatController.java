package com.ssafy.peachptich.controller;

import com.ssafy.peachptich.dto.request.AudioChatRequest;
import com.ssafy.peachptich.dto.response.ChatResponse;
import com.ssafy.peachptich.dto.response.HintResponse;
import com.ssafy.peachptich.dto.response.ResponseDto;
import com.ssafy.peachptich.entity.RandomName;
import com.ssafy.peachptich.service.ChatHistoryService;
import com.ssafy.peachptich.service.HintService;
import com.ssafy.peachptich.service.KeywordService;
import com.ssafy.peachptich.service.UserKeywordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class AudioChatController {
    private final HintService hintService;
    private final ChatHistoryService chatHistoryService;
    private final UserKeywordService userKeywordService;
    private final RandomName randomName;
    private final KeywordService keywordService;

    @PostMapping("/api/chat/ai/keywords")
    public ResponseEntity<ResponseDto<ChatResponse>> createChat(
            @RequestHeader(value = "userId", required = false) Long userId,
            @RequestBody AudioChatRequest audioChatRequest) {
        // userId 있으면 대화내역에 추가 -> 추후 jwt 토큰으로 변경
        // 키워드 id가지고 hint를 찾음
        // 힌트 리스트 조회
        Long keywordId = audioChatRequest.getKeywordId();
        String keyword = keywordService.getKeyword(keywordId);
        List<HintResponse> hints = hintService.getHints(keywordId);

        Long historyId = null; //기본적으로  null
        if (userId != null) {
            // 대화 내역 추가
            String name = randomName.getRandomName();
            historyId = chatHistoryService.addAudioChatHistory(userId, keywordId, name);
            // 유저가 고른 키워드 추가
            userKeywordService.saveOrUpdate(userId, keywordId);
        }
        ChatResponse chatResponse = ChatResponse.builder()
                .hints(hints)
                .keyword(keyword)
                .historyId(historyId)
                .build();
        return ResponseEntity.ok(ResponseDto.of("Keyword added and create AI room successfully", chatResponse));
    }
}