package com.ssafy.peachptich.controller.chat;

import com.ssafy.peachptich.dto.CustomUserDetails;
import com.ssafy.peachptich.dto.request.*;
import com.ssafy.peachptich.dto.response.*;
import com.ssafy.peachptich.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat/video")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "VideoChatController", description = "1:1 매칭 대화 관련 컨트롤러")
public class VideoChatController {
    // private final VideoChatService videoChatService;
    private final ChatHistoryService chatHistoryService;
    // private final VideoChatWebSocketService videoChatWebSocketService;

    /* @PostMapping("/request")
    public ResponseEntity<ResponseDto<VideoChatRoomResponse>> requestVideoChatRoom(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) throws OpenViduJavaClientException, OpenViduHttpException {
        // 세션에 들어가거나 만드는 요청 전부 포함 -> 매칭 되면 token, 대화내역 id 반환
        Long userId = userDetails.getUserId();
        VideoChatRoomResponse result = videoChatService.handleVideoChat(userId);
        // 첫 번째 사용자 요청 시 (token과 historyId가 null)
        if (result.getHistoryId() == null) {
            return ResponseEntity.ok().body
                    (ResponseDto.<VideoChatRoomResponse>builder()
                            .message("Waiting for another user to join")
                            .data(result)
                            .build());
        }
        //두번째 사용자 요청
        return ResponseEntity.ok().body(ResponseDto.<VideoChatRoomResponse>builder().message("Video chat matched successfully").data(result).build());
    }

    @PostMapping("/keywords")
    public ResponseEntity<ResponseDto<ChatRoomResponse>> requestVideoChatKeywords(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody VideoChatRequest videoChatRequest) {
        //들어온 userId에 맞는 keywordId 저장, userKeyword 업데이트
        //keyword에 연결된 hints 반환
        Long userId = userDetails.getUserId();
        ChatRoomResponse chatRoomResponse = videoChatService.getChatRoom(videoChatRequest, userId);
        return ResponseEntity.ok().body
                (ResponseDto.<ChatRoomResponse>builder()
                        .message("Keyword added successfully")
                        .data(chatRoomResponse).build());
    }
    */

    @PostMapping("/feedback")
    @Operation(summary = "1:1 피드백 정보 저장", description = "1:1 피드백 정보를 저장합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "성공적으로 저장됨")
    })
    public ResponseEntity<ResponseDto<Void>> requestVideoChatFeedback(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody FeedbackRequest feedbackRequest) {
        Long userId = userDetails.getUserId();
        chatHistoryService.updateFeedbackByUserId(feedbackRequest, userId);
        return ResponseEntity.ok().body(ResponseDto.<Void>builder().message("Successfully saved feedback").build());
    }

    /*
    @PostMapping("/close")
    public ResponseEntity<ResponseDto<Void>> requestVideoChatClose(
            @RequestBody CloseRequest closeRequest
    ) throws OpenViduJavaClientException, OpenViduHttpException {
        System.out.println("chat history 상태 변경 요청");
        //videoChatWebSocketService.handleCloseVideoChat(closeRequest);
        return ResponseEntity.ok().body(ResponseDto.<Void>builder().message("Successfully closed session").build());
    }*/
}
