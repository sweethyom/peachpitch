package com.ssafy.peachptich.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.peachptich.dto.CustomUserDetails;
import com.ssafy.peachptich.dto.request.ChatRequest;
import com.ssafy.peachptich.dto.request.UserChatRequest;
import com.ssafy.peachptich.dto.response.ChatReportListResponse;
import com.ssafy.peachptich.dto.response.SpeakingHabitsResponse;
import com.ssafy.peachptich.dto.response.TotalReportResponse;
import com.ssafy.peachptich.entity.*;
import com.ssafy.peachptich.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
@Service
public class ChatServiceImpl implements ChatService {
    private final RedisTemplate<String, String> redisTemplate;
    private final RedisTemplate<String, Object> objectRedisTemplate;

    private final ChatRepository chatRepository;
    private final ReportRepository reportRepository;
    private final TotalReportRepository totalReportRepository;
    private final KeywordRepository keywordRepository;
    private final ChatHistoryRepository chatHistoryRepository;

    private final ObjectMapper objectMapper;

    private static  final String CHAT_KEY_PREFIX = "chat:";


    @Override
    @Transactional
    public void saveChatContent(ChatRequest chatRequest, CustomUserDetails userDetails) {
        try {
            List<Chat> chatsToSave = new ArrayList<>();
            String redisKey = "chat:" + chatRequest.getHistoryId() + ":messages";
            Long userId = userDetails.getUserId();

            ChatHistory chatHistory = chatHistoryRepository.findById(chatRequest.getHistoryId())
                    .orElseThrow(() -> new RuntimeException("ChatHistory not found"));


            List<String> messages = redisTemplate.opsForList().range(redisKey, 0, -1);

            if (messages == null || messages.isEmpty()) {
                log.warn("대화내역 {}의 저장할 채팅 메시지가 없습니다.", chatRequest.getHistoryId());
                return;
            }

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSSSSS");

            messages.forEach(message -> {
                try {
                    JsonNode jsonNode = objectMapper.readTree(message);
                    Chat chat = Chat.builder()
                            .content(jsonNode.get("content").asText())
                            .createdAt(LocalDateTime.parse(jsonNode.get("timestamp").asText(), formatter))
                            .userId(userId)
                            .chatHistory(chatHistory)
                            .build();
                    chatsToSave.add(chat);
                } catch (JsonProcessingException e) {
                    log.error("메시지 변환 중 오류: {}", e.getMessage());
                }
            });

            if (!chatsToSave.isEmpty()) {
                chatRepository.saveAll(chatsToSave);
                redisTemplate.delete(redisKey);
                log.info("세션 {}의 Redis 데이터가 성공적으로 삭제되었습니다.", chatRequest.getHistoryId());
            }

        } catch (Exception e) {
            log.error("세션 {}의 채팅 저장 중 오류 발생: {}", chatRequest.getHistoryId(), e.getMessage());
            throw new RuntimeException("채팅 저장 실패", e);
        }
    }
//
//    @Override
//    public Chat getChatDetail(Long chatId) {
//        return null;
//    }
//
    // 랜덤 스크립트
    @Override
    public Chat getRandomChat() {
        return chatRepository.findRandomChat();
    }

    // 사용자 대화 redis 저장
    @Override
    public void saveUserChat(Long historyId, String message, Long userId) {
        try {
            String key = CHAT_KEY_PREFIX + historyId + ":messages";
            UserChatRequest userChatRequest = new UserChatRequest(historyId, message, userId);

            // 저장 전 로그 추가
            log.info("Saving chat - Key: {}, Request: {}", key, userChatRequest);

            objectRedisTemplate.opsForList().leftPush(key, userChatRequest);
        } catch (Exception e) {
            log.error("Error saving chat: ", e);
            throw new RuntimeException("Failed to save chat to Redis", e);
        }
    }

    // 대화 리포트 데이터 띄우기
    @Override
    public ChatReport getReport(Long userId, Long chatHistoryId) {
        return reportRepository.findByUserIdAndChatHistoryId(userId, chatHistoryId)
                .orElseThrow(() -> new EntityNotFoundException("Chat Report not found"));
    }


    @Override
    public TotalReportResponse getTotalReport(Long userId) {
        TotalReport totalReport = totalReportRepository.findByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("TotalReport not found"));

        // ChatReport 목록 조회 및 DTO 변환
        List<ChatReport> chatReports = reportRepository.findAllByUserIdOrderByChatHistory_CreatedAtDesc(userId);

        List<ChatReportListResponse> chatReportListResponses = chatReports.stream()
                .map(report -> {

                    String keyword1 = keywordRepository.findByKeywordId(report.getChatHistory().getKeyword1Id())
                            .map(Keyword::getKeyword)
                            .orElse(null);

                    // keyword2Id로 keyword 조회 (있는 경우에만)
                    String keyword2 = report.getChatHistory().getKeyword2Id() != null ?
                            keywordRepository.findByKeywordId(report.getChatHistory().getKeyword2Id())
                                    .map(Keyword::getKeyword)
                                    .orElse(null)
                            : null;


                    // 현재 조회하는 사용자가 user1인 경우 user2의 이름을, user2인 경우 user1의 이름을 표시
                    String partnerName;
                    if (userId.equals(report.getChatHistory().getUser1Id())) {
                        partnerName = report.getChatHistory().getUser2Name() != null ?
                                report.getChatHistory().getUser2Name() : "AI";
                    } else {
                        partnerName = report.getChatHistory().getUser1Name();
                    }

                    return ChatReportListResponse.builder()
                            .reportId(report.getReportId())
                            .partnerName(partnerName)  // 상대방 이름만 전달
                            .keyword1(keyword1)
                            .keyword2(keyword2)
                            .build();
                })
                .toList();

        List<SpeakingHabitsResponse> speakingHabitDtos = totalReport.getSpeakingHabits().stream()
                .map(habit -> SpeakingHabitsResponse.builder()
                        .wordId(habit.getWordId())
                        .word(habit.getWord())
                        .count(habit.getCount())
                        .build())
                .toList();

        return TotalReportResponse.builder()
                .totalReportId(totalReport.getTotalReportId())
                .userId(totalReport.getUser().getUserId())
                .ansCount(totalReport.getAnsCount())
                .questCount(totalReport.getQuestCount())
                .totalChatTime(totalReport.getTotalChatTime())
                .speakingHabits(speakingHabitDtos)
                .chatReports(chatReportListResponses)
                .build();
    }


//
//    @Override
//    public List<Chat> getChatsByUserId(Long userId) {
//        return null;
//    }
//
//    @Override
//    public List<Chat> getChatsByHistory(ChatHistory chatHistory) {
//        return null;
//    }
}
