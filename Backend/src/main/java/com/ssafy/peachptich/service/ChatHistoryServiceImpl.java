package com.ssafy.peachptich.service;

import com.ssafy.peachptich.dto.request.FeedbackRequest;
import com.ssafy.peachptich.entity.ChatHistory;
import com.ssafy.peachptich.repository.ChatHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ChatHistoryServiceImpl implements ChatHistoryService {
    private final ChatHistoryRepository chatHistoryRepository;

    // AI 대화 채팅내역 생성
    @Override
    public Long addAudioChatHistory(Long userId, Long keywordId, String userName) {
        ChatHistory chatHistory = ChatHistory.builder()
                .user1Id(userId)
                .keyword1Id(keywordId)
                .user1Name(userName)
                .status(true)
                .createdAt(LocalDateTime.now())
                .build();
        chatHistoryRepository.save(chatHistory);
        return chatHistory.getHistoryId();
    }

    // 1대1 대화 채팅내역 생성
    @Override
    public Long addVideoChatHistory(Long user1Id, Long user2Id, String user1Name, String user2Name) {
        ChatHistory chatHistory = ChatHistory.builder()
               .user1Id(user1Id)
               .user1Name(user1Name)
               .createdAt(LocalDateTime.now())
               .status(true)
               .build();
        chatHistory.setUser2(user2Id, user2Name);
        chatHistoryRepository.save(chatHistory);
        return chatHistory.getHistoryId();
    }

    @Override
    public void updateKeywordByUserId(Long historyId, Long userId, Long keywordId) {
        //historyId로 해당 history를 찾음
        //userId로 해당 history에서 1인지 2인지 찾음
        //1이면 keyword1에 업데이트, 2면 keyword2에 업데이트
        int updatedRows = 0;

        if (chatHistoryRepository.updateUser1Keyword(historyId, userId, keywordId) > 0) {
            updatedRows++;
        } else if (chatHistoryRepository.updateUser2Keyword(historyId, userId, keywordId) > 0) {
            updatedRows++;
        }
        if (updatedRows == 0) {
            throw new IllegalArgumentException("유효하지 않은 userId 또는 historyId");
        }
    }

    @Override
    public void updateFeedbackByUserId(FeedbackRequest feedbackRequest, Long userId) {
        int updatedRows = 0;
        Long historyId = feedbackRequest.getHistoryId();
        String feedback = feedbackRequest.getFeedback();
        if (chatHistoryRepository.updateUser1Feedback(historyId, userId, feedback) > 0) {
            updatedRows++;
        }
        if (chatHistoryRepository.updateUser2Feedback(historyId, userId, feedback) > 0) {
            updatedRows++;
        }
        if (updatedRows == 0) {
            throw new IllegalArgumentException("유효하지 않은 userId 또는 historyId");
        }
    }

    @Override
    public ChatHistory getChatHistory(Long historyId) {
        return chatHistoryRepository.findById(historyId).orElseThrow(() -> new IllegalArgumentException("유효하지 않은 채팅 내역"));
    }
}
