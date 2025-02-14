package com.ssafy.peachptich.service;

import com.ssafy.peachptich.dto.request.AudioChatRequest;
import com.ssafy.peachptich.dto.request.ChatRequest;
import com.ssafy.peachptich.dto.request.CloseRequest;
import io.openvidu.java.client.OpenViduHttpException;
import io.openvidu.java.client.OpenViduJavaClientException;

public interface VideoChatWebSocketService {
    void handleVideoChatWebSocket(String userEmail) throws OpenViduHttpException, OpenViduJavaClientException;
    void handleVideoChatKeyword(AudioChatRequest videoChatRequest, Long historyId, String userEmail);
    void closeSession(CloseRequest closeRequest) throws OpenViduJavaClientException, OpenViduHttpException;
    void handleVideoChatWebSocketDisconnect(String userEmail);
//    void handleVideoChatKeywordDisconnect(Long historyId, String userEmail);
}
