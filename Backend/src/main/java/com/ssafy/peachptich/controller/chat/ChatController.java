package com.ssafy.peachptich.controller.chat;

import com.ssafy.peachptich.dto.CustomUserDetails;
import com.ssafy.peachptich.dto.request.ChatRequest;
import com.ssafy.peachptich.dto.request.ReportRequest;
import com.ssafy.peachptich.dto.request.TotalReportRequest;
import com.ssafy.peachptich.dto.request.UserChatRequest;
import com.ssafy.peachptich.dto.response.RandomScriptResponse;
import com.ssafy.peachptich.dto.response.ReportResponse;
import com.ssafy.peachptich.dto.response.ResponseDto;
import com.ssafy.peachptich.dto.response.TotalReportResponse;
import com.ssafy.peachptich.entity.Chat;
import com.ssafy.peachptich.entity.ChatReport;
import com.ssafy.peachptich.entity.TotalReport;
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

    // Django에서 redis에 저장한 AI 대화내용 db에 저장하기
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

    // 랜덤 스크립트 기능
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

    // 사용자와의 대화 redis 저장
    @PostMapping("chat/video/save/temp")
    public ResponseEntity<Void> saveChatTemp(@RequestBody UserChatRequest userChatRequest) {
        chatService.saveUserChatTemp(userChatRequest);
        return ResponseEntity.ok().build();
    }

    // redis에 저장한 사용자와의 대화 db저장
    @PostMapping("chat/video/save")
    public ResponseEntity<Void> saveChat(@RequestBody UserChatRequest userChatRequest){
        log.debug("Request received: {}", userChatRequest);

        if (userChatRequest.getUserId() == null) {
            log.error("User ID is missing in the request");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            chatService.saveUserChat(userChatRequest);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Failed to save chat content", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }



    // 대화 상세 리포트
    @GetMapping("users/reports/report")
    public ResponseEntity<ResponseDto<ReportResponse>> showReport(@RequestBody ReportRequest reportRequest) {
        // 리포트 내용 가져오기
        ChatReport chatReport = chatService.getReport(reportRequest.getUserId(), reportRequest.getHistoryId());

        // Response DTO로 변환
        ReportResponse response = ReportResponse.builder()
                .reportId(chatReport.getReportId())
                .chatTime(chatReport.getChatTime())
                .pros(chatReport.getPros())
                .cons(chatReport.getCons())
                .summary(chatReport.getSummary())
                .createdAt(chatReport.getChatHistory().getCreatedAt())
                .historyId(chatReport.getChatHistory().getHistoryId())
                .userId(chatReport.getUser().getUserId())
                .build();

        return ResponseEntity.ok()
                .body(new ResponseDto<>("Report showed successfully", response));
    }

    // 전체 리포트
    @GetMapping("users/reports/totalreport")
    public ResponseEntity<ResponseDto<TotalReportResponse>> showOverview(@RequestBody TotalReportRequest totalReportRequest) {
        // TotalReportResponse를 반환받음
        TotalReportResponse response = chatService.getTotalReport(totalReportRequest.getUserId());

        return ResponseEntity.ok()
                .body(new ResponseDto<>("Report showed successfully", response));
    }

}