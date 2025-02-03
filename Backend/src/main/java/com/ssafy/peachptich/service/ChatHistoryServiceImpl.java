package com.ssafy.peachptich.service;

import com.ssafy.peachptich.entity.ChatHistory;
import com.ssafy.peachptich.repository.ChatHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
                .build();
        chatHistoryRepository.save(chatHistory);
        return chatHistory.getHistoryId();
    }

    // 1대1 대화 채팅내역 생성
    @Override
    public Long addVideoChatHistory(Long user1Id, Long user2Id, Long keyword1Id, Long keyword2Id, String user1Name, String user2Name) {
       ChatHistory chatHistory = ChatHistory.builder()
               .user1Id(user1Id)
               .user2Id(user2Id)
               .keyword1Id(keyword1Id)
               .keyword2Id(keyword2Id)
               .user1Name(user1Name)
               .user2Name(user2Name)
               .status(true)
               .build();
        chatHistoryRepository.save(chatHistory);
        return chatHistory.getHistoryId();
    }
}
