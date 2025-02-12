package com.ssafy.peachptich.controller.chat;

import com.ssafy.peachptich.dto.CustomUserDetails;
import com.ssafy.peachptich.dto.request.ChatRequest;
import com.ssafy.peachptich.dto.request.UserChatRequest;
import com.ssafy.peachptich.dto.response.RandomScriptResponse;
import com.ssafy.peachptich.dto.response.ResponseDto;
import com.ssafy.peachptich.entity.Chat;
import com.ssafy.peachptich.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api")
public class ChatController {
    private final ChatService chatService;

    // 대화내용 db에 저장하기
    @PostMapping("chat/save")
    public ResponseEntity<Void> saveChatContent(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody ChatRequest chatrequest) {
        System.out.println("컨트롤러 호출됨");
        System.out.println("Request: " + chatrequest);

        try {
            if (userDetails == null) {
                log.error("인증 정보가 없습니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            chatService.saveChatContent(chatrequest, userDetails);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace(); // 콘솔에 직접 출력
            log.error("채팅 저장 중 오류 발생: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/main/randomscript")
    public ResponseEntity<ResponseDto<RandomScriptResponse>> showRandomScript() {
        // 랜덤 채팅 가져오기
        Chat randomChat = chatService.getRandomChat();

        // Response DTO로 변환
        RandomScriptResponse response = RandomScriptResponse.builder()
                .chatId(randomChat.getChatId())
                .content(randomChat.getContent())
                .build();

        return ResponseEntity.ok()
                .body(new ResponseDto<>("Randomchat showed successfully", response));
    }

    @PostMapping("chat/video/save")
    public ResponseEntity<String> saveChat(@RequestBody UserChatRequest userChatRequest) {
        chatService.saveUserChat(userChatRequest.getHistoryId(), userChatRequest.getMessage(), userChatRequest.getUserId());
        return ResponseEntity.ok("Chat saved in redis");
    }

}
