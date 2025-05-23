package com.ssafy.peachptich.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.peachptich.dto.CustomUserDetails;
import com.ssafy.peachptich.dto.request.ChatRequest;
import com.ssafy.peachptich.dto.request.ReportRequest;
import com.ssafy.peachptich.dto.request.UserChatRequest;
import com.ssafy.peachptich.dto.response.ChatReportListResponse;
import com.ssafy.peachptich.dto.response.SpeakingHabitsResponse;
import com.ssafy.peachptich.dto.response.TotalReportResponse;
import com.ssafy.peachptich.entity.*;
import com.ssafy.peachptich.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
public class ChatServiceImpl implements ChatService {
    private final RedisTemplate<String, String> redisTemplate;
    private final RedisTemplate<String, Object> objectRedisTemplate;

    // redis 저장 이벤트 발행
    private final ApplicationEventPublisher publisher;

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
                    String role = jsonNode.get("role").asText();

                    Chat chat = Chat.builder()
                            .content(jsonNode.get("content").asText())
                            .createdAt(LocalDateTime.parse(jsonNode.get("timestamp").asText(), formatter))
                            .userId("assistant".equals(role) ? null : userId)  // assistant면 null, 아니면 userId
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

    // 랜덤 스크립트
    @Override
    public Chat getRandomChat() {
        return chatRepository.findRandomChatWithUserId();
    }

    // 사용자 대화 redis 저장
    @Transactional
    @Override
    public void saveUserChatTemp(UserChatRequest userChatRequest) {
        try {
            String key = CHAT_KEY_PREFIX + userChatRequest.getHistoryId() + ":messages";

            log.info("Saving chat - Key: {}, Request: {}", key, userChatRequest);
            log.info("event");

            objectRedisTemplate.opsForList().rightPush(key, userChatRequest);
            publisher.publishEvent(userChatRequest); // 이벤트 발생
        } catch (Exception e) {
            log.error("Error saving chat: ", e);
            throw new RuntimeException("Failed to save chat to Redis", e);
        }
    }

    @Override
    public void saveUserChat(ChatRequest chatRequest) {
        try {
            List<Chat> chatsToSave = new ArrayList<>();
            String redisKey = "chat:" + chatRequest.getHistoryId() + ":messages";

            //String userIdKey = "chat:" + chatRequest.getHistoryId() + ":userId";
            //Long userId = Long.parseLong(redisTemplate.opsForValue().get(userIdKey));

            ChatHistory chatHistory = chatHistoryRepository.findById(chatRequest.getHistoryId())
                    .orElseThrow(() -> new RuntimeException("ChatHistory not found"));


            List<String> messages = redisTemplate.opsForList().range(redisKey, 0, -1);

            if (messages == null || messages.isEmpty()) {
                log.warn("대화내역 {}의 저장할 채팅 메시지가 없습니다.", chatRequest.getHistoryId());
                return;
            }

//            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSSSS");
            messages.forEach(message -> {
                try {
                    JsonNode jsonNode = objectMapper.readTree(message);
                    log.info("파싱된 메시지: {}", jsonNode.toString());

                    String content = jsonNode.has("message") ? jsonNode.get("message").asText() : "";
                    LocalDateTime createdAt = LocalDateTime.now(); // 기본값 설정
                    Long userId = jsonNode.has("userId") ? jsonNode.get("userId").asLong() : 0; // null은 ai로 인식

                    if (jsonNode.has("createdAt") && !jsonNode.get("createdAt").isNull()) {
                        try {
                            createdAt = LocalDateTime.parse(jsonNode.get("createdAt").asText(),
                                    DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSSSS"));
                        } catch (Exception e) {
                            log.error("날짜 파싱 실패: {}", e.getMessage());
                        }
                    }

                    Chat chat = Chat.builder()
                            .content(content)
                            .createdAt(createdAt)
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


    @Override
    public List<Chat> getChatsByHistoryId(Long historyId) {
        return chatRepository.findByChatHistory_HistoryIdOrderByCreatedAtAsc(historyId);
    }

    @Override
    public ChatReport getReport(@RequestBody ReportRequest reportRequest) {
        log.info("리포트 조회 시작 - userId: {}, reportId: {}",
                reportRequest.getUserId(), reportRequest.getReportId());

        try {
            ChatReport chatReport = reportRepository
                    .findByUserIdAndReportId(reportRequest.getUserId(), reportRequest.getReportId())
                    .orElseThrow(() -> {
                        log.error("리포트를 찾을 수 없습니다 - userId: {}, reportId: {}",
                                reportRequest.getUserId(), reportRequest.getReportId());
                        return new EntityNotFoundException("Chat Report not found");
                    });

            log.info("리포트 조회 완료 - reportId: {}, historyId: {}",
                    chatReport.getReportId(),
                    chatReport.getChatHistory() != null ? chatReport.getChatHistory().getHistoryId() : "null");

            return chatReport;

        } catch (Exception e) {
            log.error("리포트 조회 중 예외 발생 - userId: {}, reportId: {}",
                    reportRequest.getUserId(), reportRequest.getReportId(), e);
            throw e;
        }
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

    /*
    public ChatResponse getTempRecentChat(Long historyId) {
        String redisKey = "chat:" + historyId + ":messages";
        String message = redisTemplate.opsForList().index(redisKey, -1);
        ChatResponse chatResponse = ChatResponse.builder().build();
        try {
            JsonNode jsonNode = objectMapper.readTree(message);
            log.info("파싱된 메시지: {}", jsonNode.toString());

            String content = jsonNode.has("message") ? jsonNode.get("message").asText() : "";
            LocalDateTime createdAt = LocalDateTime.now(); // 기본값 설정

            if (jsonNode.has("createdAt") && !jsonNode.get("createdAt").isNull()) {
                try {
                    createdAt = LocalDateTime.parse(jsonNode.get("createdAt").asText(),
                            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSSSS"));
                } catch (Exception e) {
                    log.error("날짜 파싱 실패: {}", e.getMessage());
                }
            }
            Long userId = jsonNode.has("userId") ? jsonNode.get("userId").asLong() : null;
            chatResponse = ChatResponse.builder().content(content).createdAt(createdAt).userId(userId).build();
            return chatResponse;
        } catch (JsonProcessingException e) {
            log.error("메시지 변환 중 오류: {}", e.getMessage());
        }
        return chatResponse;
    }
    */


}
