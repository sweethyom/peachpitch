package com.ssafy.peachptich.controller;

import com.ssafy.peachptich.dto.request.FeedbackRequest;
import com.ssafy.peachptich.dto.request.VideoChatRequest;
import com.ssafy.peachptich.dto.response.*;
import com.ssafy.peachptich.service.*;
import io.openvidu.java.client.OpenViduHttpException;
import io.openvidu.java.client.OpenViduJavaClientException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat/video")
@RequiredArgsConstructor
public class VideoChatController {
    private final VideoChatService videoChatService;
    private final HintService hintService;
    private final UserKeywordService userKeywordService;
    private final ChatHistoryService chatHistoryService;
    private final KeywordService keywordService;

    @PostMapping("/request")
    public ResponseEntity<ResponseDto<RoomResponse>> requestVideoChatRoom(
            @RequestHeader(value = "userId", required = false) Long userId
    ) throws OpenViduJavaClientException, OpenViduHttpException {
        // userId 가지고 대화내역에 추가 -> 추후 jwt 토큰으로 변경
        // 세션에 들어가거나 만드는 요청 전부 포함 -> 매칭 되면 token, 대화내역 id 반환
        RoomResponse result = videoChatService.handleVideoChat(userId);
        // 첫 번째 사용자 요청 시 (token과 historyId가 null)
        if (result.getHistoryId() == null) {
            return ResponseEntity.ok(new ResponseDto<>("Waiting for another user to join", result));
        }
        //두번째 사용자 요청
        return ResponseEntity.ok(new ResponseDto<>("Video chat matched successfully",
                result));
    }

    @PostMapping("/keywords")
    public ResponseEntity<ResponseDto<ChatResponse>> requestVideoChatKeywords(
            @RequestHeader(value = "userId", required = false) Long userId,
            @RequestBody VideoChatRequest videoChatRequest)
    {
        //userId, historyId, keywordId로
        //들어온 userId에 맞는 keywordId 저장, userKeyword 업데이트
        //keyword에 연결된 hints 반환

        Long keywordId = videoChatRequest.getKeywordId();
        Long historyId = videoChatRequest.getHistoryId();

        String keyword = keywordService.getKeyword(keywordId);
        // user가 고른 키워드로 힌트 반환
        List<HintResponse> hints = hintService.getHints(keywordId);
        // 유저가 고른 키워드 추가
        userKeywordService.saveOrUpdate(userId, keywordId);
        // 대화 내역에 유저가 한 피드백 업데이트
        chatHistoryService.updateKeywordByUserId(historyId, userId, keywordId);
        ChatResponse chatResponse = ChatResponse.builder()
                .hints(hints)
                .keyword(keyword)
                .historyId(historyId)
                .build();
        return ResponseEntity.ok(new ResponseDto<>("Keyword added successfully", chatResponse));
    }

    @PostMapping("/feedback")
    public ResponseEntity<ResponseDto<Void>> requestVideoChatFeedback(
            @RequestHeader(value = "userId", required = false) Long userId,
            @RequestBody FeedbackRequest feedbackRequest)
    {
        Long historyId = feedbackRequest.getHistoryId();
        String feedback = feedbackRequest.getFeedback();
        chatHistoryService.updateFeedbackByUserId(historyId, userId, feedback);
        return ResponseEntity.ok(new ResponseDto<>("Successfully saved feedback", null));
    }

}
