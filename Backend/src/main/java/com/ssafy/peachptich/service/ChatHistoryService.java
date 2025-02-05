package com.ssafy.peachptich.service;

import com.ssafy.peachptich.entity.ChatHistory;

public interface ChatHistoryService {
    Long addAudioChatHistory(Long userId, Long keywordId, String userName);
    Long addVideoChatHistory(Long user1Id, Long user2Id, String user1Name, String user2Name);
}
