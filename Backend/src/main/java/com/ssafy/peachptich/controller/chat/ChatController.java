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
import com.ssafy.peachptich.entity.ChatHistory;
import com.ssafy.peachptich.entity.ChatReport;
import com.ssafy.peachptich.entity.TotalReport;
import com.ssafy.peachptich.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "ChatController", description = "채팅 기록 관련 컨트롤러")
public class ChatController {
    private final ChatService chatService;

    // Django에서 redis에 저장한 AI 대화내용 db에 저장하기
    @PostMapping("/chat/save")
    @Operation(summary = "redis에 저장된 AI 대화내용 DB 저장", description = "redis에 저장된 AI 대화 내용을 DB에 저장합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "성공적으로 저장됨"),
            @ApiResponse(responseCode = "401", description = "인증 정보가 없음"),
            @ApiResponse(responseCode = "500", description = "채팅 저장 중 오류 발생")
    })
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
    @Operation(summary = "랜덤 스크립트 기능", description = "랜덤 스크립트를 가져옵니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "랜덤 스크립트 로드 성공")
    })
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
    @PostMapping("/chat/video/save/temp")
    @Operation(summary = "1:1 대화 redis 저장", description = "1:1 대화 내용을 redis에 저장합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "성공적으로 저장됨")
    })

    public ResponseEntity<Void> saveChatTemp(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody UserChatRequest userChatRequest) {
        chatService.saveUserChatTemp(userChatRequest);
        return ResponseEntity.ok().build();
    }

    // redis에 저장한 사용자와의 대화 db저장
    @PostMapping("/chat/video/save")
    @Operation(summary = "redis에 저장된 1:1 대화 내용 DB 저장", description = "redis에 저장된 1:1 대화 내용을 DB에 저장합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "성공적으로 저장됨"),
            @ApiResponse(responseCode = "401", description = "인증 정보가 없음"),
            @ApiResponse(responseCode = "500", description = "채팅 저장 중 오류 발생")
    })
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
    @PostMapping("/users/reports/report")
    @Operation(summary = "대화 상세 리포트 생성", description = "대화 상세 리포트를 생성합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "성공적으로 생성함")
    })
    public ResponseEntity<ResponseDto<ReportResponse>> showReport(@RequestBody ReportRequest reportRequest) {
        log.info("대화리포트 조회시작");
        // 리포트 내용 가져오기
        ChatReport chatReport = chatService.getReport(reportRequest);
        ChatHistory chatHistory = chatReport.getChatHistory();

        log.info("채팅 내역 조회 시작");
        // historyId로 채팅 내역 조회
        List<Chat> chatList = chatService.getChatsByHistoryId(chatReport.getChatHistory().getHistoryId());

        // 채팅 내역을 ChatMessageResponse로 변환
        List<ReportResponse.ChatMessageResponse> chatMessages = chatList.stream()
                .map(chat -> ReportResponse.ChatMessageResponse.builder()
                        .chatId(chat.getChatId())
                        .content(chat.getContent())
                        .userId(chat.getUserId())
                        .createdAt(chat.getCreatedAt())
                        .build())
                .toList();

        // 피드백 가져오기 (상대방이 남긴 피드백)
        String feedback = null;
        if (chatReport.getUser().getUserId().equals(chatHistory.getUser1Id())) {
            feedback = chatHistory.getUser2Feedback();  // user1의 리포트에는 user2의 피드백
        } else {
            feedback = chatHistory.getUser1Feedback();  // user2의 리포트에는 user1의 피드백
        }

        log.info("Response DTO로 변환시작");
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
                .chatMessages(chatMessages)  // 채팅 메시지 리스트 추가
                .feedback(feedback)
                .build();

        log.info("Response DTO로 변환완료");
        return ResponseEntity.ok()
                .body(new ResponseDto<>("Report showed successfully", response));
    }


    // 전체 리포트
    @PostMapping("/users/reports/totalreport")
    @Operation(summary = "전체 리포트 ", description = "대화 상세 리포트를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "성공적으로 조회함")
    })
    public ResponseEntity<ResponseDto<TotalReportResponse>> showOverview(@RequestBody TotalReportRequest totalReportRequest) {
        // TotalReportResponse를 반환받음
        TotalReportResponse response = chatService.getTotalReport(totalReportRequest.getUserId());

        return ResponseEntity.ok()
                .body(new ResponseDto<>("Report showed successfully", response));
    }

}