package com.ssafy.peachptich.controller.chat;

import com.ssafy.peachptich.dto.request.AudioChatRequest;
import com.ssafy.peachptich.dto.request.CloseRequest;
import com.ssafy.peachptich.dto.request.UserChatRequest;
import com.ssafy.peachptich.service.UserService;
import com.ssafy.peachptich.service.VideoChatWebSocketService;
import io.openvidu.java.client.OpenViduHttpException;
import io.openvidu.java.client.OpenViduJavaClientException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;


@Controller
@RequiredArgsConstructor
@Slf4j
@Tag(name = "VideoChatWebSocketController", description = "화상 채팅 대화 기록 관련 컨트롤러")
public class VideoChatWebSocketController {
    private final VideoChatWebSocketService videoChatService;
    private final UserService userService;

    /* userId로 웹소켓
    @MessageMapping("/request") // 클라이언트가 /pub/request로 header에 userId 담아서 보냄
    public synchronized void requestVideoChatRoom(
            @Header(value = "userId", required = false) Long userId
    ) throws OpenViduJavaClientException, OpenViduHttpException {
        videoChatService.handleVideoChatWebSocket(userId);
    }*/

    /* subscribe 헤더에 jwt 토큰으로 웹소켓
    @MessageMapping("/request") // 클라이언트가 /pub/request로 header에 userId 담아서 보냄
    public synchronized void requestVideoChatRoom(
            @Header("access") String Authorization
    ) throws OpenViduJavaClientException, OpenViduHttpException {
        String email = tokenProvider.getUserEmail(Authorization);
        Long userId = userRepository.findUserIdByEmail(email);
        videoChatService.handleVideoChatWebSocket(userId);
    }
     */
    @Builder
    @Getter
    @AllArgsConstructor
    public static class ChatMessage {
        private String type;      // "REQUEST", "TERMINATE"
        private String sessionEndType;  // KEYWORD, AUTO, MANUAL 키워드 고르다가 나감, 자동 종료, 강제 종료
        private String sessionId;
        private Long historyId;
        private String matchedUserEmail;
    }

    @MessageMapping("/chat")
    @Operation(summary = "1:1 화상 채팅방 생성 및 종료", description = "1:1 화상 채팅방을 생성/종료합니다.")
    public synchronized void handleVideoChatMessage(
            StompHeaderAccessor accessor,
            ChatMessage chatMessage
    )throws OpenViduJavaClientException, OpenViduHttpException {
        Principal principal = accessor.getUser();
        if(principal != null) {
            String email = principal.getName();
            System.out.println(chatMessage.getType());
            switch(chatMessage.getType()) {
                case "REQUEST":
                    videoChatService.handleVideoChatWebSocket(email);
                    break;
                case "TERMINATE":
                    CloseRequest closeRequest = CloseRequest.builder()
                            .sessionId(chatMessage.getSessionId())
                            .historyId(chatMessage.getHistoryId())
                            .matchedUserEmail(chatMessage.getMatchedUserEmail())
                            .sessionEndType(chatMessage.getSessionEndType())
                            .build();
                    videoChatService.handleCloseVideoChat(closeRequest, email);
                    break;
            }
        }

    }

    // accessor에 있는 principal로 user 각각에게 토큰 전송
//    @MessageMapping("/request")
//    public synchronized void requestVideoChatRoom(
//            StompHeaderAccessor accessor
//    ) throws OpenViduJavaClientException, OpenViduHttpException {
//        // STOMP 세션에서 user 가져오기
//        Principal principal = accessor.getUser();
//        if (principal != null) {
//            String email = principal.getName();
//            videoChatService.handleVideoChatWebSocket(email);
//        } else {
//            log.error("Principal이 null입니다. WebSocket 연결에 실패했습니다.");
//        }
//    }

    // 같은 화상 채팅방에 있는 유저 두명이 키워드를 선택할 때마다 힌트 전송
    @MessageMapping("/keyword/{historyId}")
    @Operation(summary = "1:1 화상 채팅 힌트 제공", description = "1:1 화상 채팅 힌트를 전송합니다.")
    public synchronized void sendVideoChatKeyword(
            StompHeaderAccessor accessor,
            @DestinationVariable Long historyId,
            AudioChatRequest videoChatRequest) {
        Principal principal = accessor.getUser();
        if (principal != null) {
            String email = principal.getName();
            videoChatService.handleVideoChatKeyword(videoChatRequest, historyId, email);
        } else {
            log.error("Principal이 null입니다. WebSocket 연결에 실패했습니다.");
        }
    }

    @EventListener
    public void handleSessionDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal principal = accessor.getUser();
        if(principal!=null)
            videoChatService.handleVideoChatWebSocketDisconnect(principal.getName());
    }

    // redis에 채팅 저장 이벤트 발생시 호출됨
    @EventListener
    public void handleChatMessageEvent(UserChatRequest userChatRequest) {
        videoChatService.handleSendVideoChatMessage(userChatRequest);
    }
}
