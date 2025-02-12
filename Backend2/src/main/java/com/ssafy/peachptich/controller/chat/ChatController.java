package com.ssafy.peachptich.controller.chat;

import com.ssafy.peachptich.dto.CustomUserDetails;
import com.ssafy.peachptich.dto.request.ChatRequest;
import com.ssafy.peachptich.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/chat/report")
public class ChatController {
    private final ChatService chatService;

    // 대화내용 db에 저장하기
    @PostMapping("/save")
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

}
    // 대화내용 가져오기
    // 하나는 랜덤스크립트로
    // 하나는 리포트
    // 리포트 1. 전체 리포트
    // 리포트 2. 대화 상세 리포트
