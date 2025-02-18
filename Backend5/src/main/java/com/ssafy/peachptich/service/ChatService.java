package com.ssafy.peachptich.service;

import com.ssafy.peachptich.dto.CustomUserDetails;
import com.ssafy.peachptich.dto.request.ChatRequest;
import com.ssafy.peachptich.dto.request.ReportRequest;
import com.ssafy.peachptich.dto.request.UserChatRequest;
import com.ssafy.peachptich.dto.response.TotalReportResponse;
import com.ssafy.peachptich.entity.Chat;
import com.ssafy.peachptich.entity.ChatHistory;
import com.ssafy.peachptich.entity.ChatReport;
import com.ssafy.peachptich.entity.TotalReport;

import java.util.List;

/**
 * 1. 대화 저장하기_Redis에 저장된 채팅 내용을 DB에 저장
 * 2. 모든 대화 내용 가져오기_저장된 모든 채팅 내용 조회
 * @return 전체 채팅 내용 리스트
 * 3. 특정 채팅의 상세 내용 조회
 * @param chatId 조회할 채팅의 id
 * @return 특정 채팅의 상세 내용
 * 4. 랜덤스크립트_저장된 채팅 중 무작위로 하나를 선택해 반환
 * @return 무작위로 선택된 채팅 내용
 */
public interface ChatService {
    void saveChatContent(ChatRequest chatRequest, CustomUserDetails userDetails);
    Chat getRandomChat();
    // 사용자대화 redis 저장
    void saveUserChatTemp(UserChatRequest userChatRequest);
    // 사용자대화 db 저장
    void saveUserChat(ChatRequest chatRequest, Long userId);
    // 특정 대화 조회
    List<Chat> getChatsByHistoryId(Long historyId);
    // 대화 리포트 조회
    ChatReport getReport(ReportRequest reportRequest);

    // 전체 리포트 조회
    TotalReportResponse getTotalReport(Long userId);

//    /**
//     * 특정 유저의 채팅 내용 조회 (필요한 경우)
//     */
//    List<Chat> getChatsByUserId(Long userId);
//
//    /**
//     * 특정 채팅 히스토리의 모든 채팅 조회 (필요한 경우)
//     */
//    List<Chat> getChatsByHistory(ChatHistory chatHistory);
}
