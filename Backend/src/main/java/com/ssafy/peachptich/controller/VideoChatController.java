package com.ssafy.peachptich.controller;

import com.ssafy.peachptich.dto.request.FeedbackRequestDto;
import com.ssafy.peachptich.dto.request.VideoChatRequestDto;
import com.ssafy.peachptich.dto.response.*;
import com.ssafy.peachptich.service.ChatHistoryService;
import com.ssafy.peachptich.service.HintService;
import com.ssafy.peachptich.service.UserKeywordService;
import com.ssafy.peachptich.service.VideoChatService;
import io.openvidu.java.client.OpenViduHttpException;
import io.openvidu.java.client.OpenViduJavaClientException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/chat/video")
@RequiredArgsConstructor
public class VideoChatController {
    private final VideoChatService videoChatService;
    private final HintService hintService;
    private final UserKeywordService userKeywordService;
    private final ChatHistoryService chatHistoryService;

    @PostMapping("/request")
    public ResponseEntity<ResponseDto<RoomResponseDto>> requestVideoChatRoom(
            @RequestHeader(value = "userId", required = false) Long userId
    ) throws OpenViduJavaClientException, OpenViduHttpException {
        // userId 가지고 대화내역에 추가 -> 추후 jwt 토큰으로 변경
        // 세션에 들어가거나 만드는 요청 전부 포함 -> 매칭 되면 token, 대화내역 id 반환
        RoomResponseDto result = videoChatService.handleVideoChat(userId);
        // 첫 번째 사용자 요청 시 (token과 historyId가 null)
        if (result.getHistoryId() == null) {
            return ResponseEntity.ok(ResponseDto.of("Waiting for another user to join", result));
        }
        //두번째 사용자 요청
        return ResponseEntity.ok(ResponseDto.of("Video chat matched successfully",
                result));
    }

    @PostMapping("/keywords")
    public ResponseEntity<ResponseDto<ChatResponseDto>> requestVideoChatKeywords(
            @RequestHeader(value = "userId", required = false) Long userId,
            @RequestBody VideoChatRequestDto videoChatRequestDto)
    {
        //userId, historyId, keywordId로
        //들어온 userId에 맞는 keywordId 저장, userKeyword 업데이트
        //keyword에 연결된 hints 반환

        Long keywordId = videoChatRequestDto.getKeywordId();
        Long historyId = videoChatRequestDto.getHistoryId();

        // user가 고른 키워드로 힌트 반환
        List<HintResponseDto> hints = hintService.getHints(keywordId);
        // 유저가 고른 키워드 추가
        userKeywordService.saveOrUpdate(userId, keywordId);
        chatHistoryService.updateKeywordByUserId(historyId, userId, keywordId);
        ChatResponseDto chatResponseDto = ChatResponseDto.builder()
                .hints(hints)
                .historyId(historyId)
                .build();
        return ResponseEntity.ok(ResponseDto.of("Keyword added successfully", chatResponseDto));
    }

    @PostMapping("/feedback")
    public ResponseEntity<ResponseDto<Void>> requestVideoChatFeedback(
            @RequestHeader(value = "userId", required = false) Long userId,
            @RequestBody FeedbackRequestDto feedbackRequestDto)
    {
        Long historyId = feedbackRequestDto.getHistoryId();
        String feedback = feedbackRequestDto.getFeedback();
        chatHistoryService.updateFeedbackByUserId(historyId, userId, feedback);
        return ResponseEntity.ok(ResponseDto.of("Successfully saved feedback", null));
    }

}
