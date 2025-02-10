package com.ssafy.peachptich.controller;

import com.ssafy.peachptich.dto.CustomUserDetails;
import com.ssafy.peachptich.dto.request.AudioChatRequest;
import com.ssafy.peachptich.dto.request.TrialRequest;
import com.ssafy.peachptich.dto.response.ChatRoomResponse;
import com.ssafy.peachptich.dto.response.ResponseDto;
import com.ssafy.peachptich.entity.RandomName;
import com.ssafy.peachptich.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat/ai")
@RequiredArgsConstructor
@Slf4j
public class AudioChatController {
    private final AudioChatService audioChatService;

    /**
     * AI 채팅을 눌렀을 때 -> 로그인 되었고 쿠폰이 남아있으면 true, 쿠폰이 안남아있으면 false
     * -> 로그인 안되었고 finger print가 없으면 true, 있으면 false
     * @return
     */
    @GetMapping("/check")
    public ResponseEntity<ResponseDto<Boolean>> checkAvailable(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody(required = false) TrialRequest trialRequest
    ) {
        boolean isAvailable = audioChatService.isAvailable(trialRequest, userDetails);
        return ResponseEntity.ok().
                body(ResponseDto.<Boolean>builder()
                        .message("AI chat available")
                        .data(isAvailable)
                        .build());
    }

    /**
     * 키워드를 선택 했을 때 쿠폰 없으면 return(위에서 걸렀음), 있으면 쿠폰 차감 후 대화 내역 생성
     * 키워드를 선택 했을 때 로그인 안 한 사용자면 바로 대화 내역 생성
     *
     * @param userDetails
     * @param audioChatRequest
     * @return
     */
    @PostMapping("/keywords")
    public ResponseEntity<ResponseDto<ChatRoomResponse>> createChat(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody AudioChatRequest audioChatRequest) {
        ChatRoomResponse chatRoomResponse = audioChatService.getChatRoom(audioChatRequest, userDetails);
        return ResponseEntity.ok()
                .body(ResponseDto.<ChatRoomResponse>builder()
                        .message("Keyword added and create AI room successfully")
                        .data(chatRoomResponse)
                        .build());
    }
}