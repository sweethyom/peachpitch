package com.ssafy.peachptich.controller.chat;

import com.ssafy.peachptich.dto.CustomUserDetails;
import com.ssafy.peachptich.dto.request.AudioChatRequest;
import com.ssafy.peachptich.dto.request.TrialRequest;
import com.ssafy.peachptich.dto.response.ChatRoomResponse;
import com.ssafy.peachptich.dto.response.ResponseDto;
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
@RequestMapping("/api/chat/ai")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "AudioChatController", description = "AI 채팅 관련 컨트롤러")
public class AudioChatController {
    private final AudioChatService audioChatService;

    /**
     * AI 채팅을 눌렀을 때 -> 로그인 되었고 쿠폰이 남아있으면 true, 쿠폰이 안남아있으면 false
     * -> 로그인 안되었고 finger print가 없으면 true, 있으면 false
     * @return
     */
    @PostMapping("/check")
    @Operation(summary = "AI 채팅 이용 가능 조회", description = "회원이 AI 채팅을 이용할 수 있는지 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "성공적으로 조회함, true:가능/false:불가능")
    })
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
    @Operation(summary = "AI 대화 키워드 추가", description = "AI 채팅방에 키워드를 추가합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "성공적으로 추가함")
    })
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