package com.ssafy.peachptich.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.peachptich.dto.CustomUserDetails;
import com.ssafy.peachptich.dto.request.ChatRequest;
import com.ssafy.peachptich.dto.request.UserChatRequest;
import com.ssafy.peachptich.entity.Chat;
import com.ssafy.peachptich.entity.ChatHistory;
import com.ssafy.peachptich.repository.ChatHistoryRepository;
import com.ssafy.peachptich.repository.ChatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
public class ChatServiceImpl implements ChatService{
    private final RedisTemplate<String, String> redisTemplate;
    private final RedisTemplate<String, Object> objectRedisTemplate;
    private final ChatRepository chatRepository;
    private final ObjectMapper objectMapper;
    private final ChatHistoryRepository chatHistoryRepository;
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
//}
//    @Override
//    public List<Chat> getAllChats() {
//        return null;
//    }
//
//    @Override
//    public Chat getChatDetail(Long chatId) {
//        return null;
//    }
//
    @Override
    public Chat getRandomChat() {
        return chatRepository.findRandomChat();
    }

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
