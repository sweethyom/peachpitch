package com.ssafy.peachptich.service;

import com.ssafy.peachptich.dto.request.AudioChatRequest;
import com.ssafy.peachptich.dto.request.CloseRequest;
import com.ssafy.peachptich.dto.request.UserChatRequest;
import io.openvidu.java.client.OpenViduHttpException;
import io.openvidu.java.client.OpenViduJavaClientException;

public interface VideoChatWebSocketService {
    void handleVideoChatWebSocket(String userEmail) throws OpenViduHttpException, OpenViduJavaClientException;
    void handleVideoChatKeyword(AudioChatRequest videoChatRequest, Long historyId, String userEmail);
    void handleCloseVideoChat(CloseRequest closeRequest, String userEmail) throws OpenViduJavaClientException, OpenViduHttpException;
    void handleVideoChatWebSocketDisconnect(String userEmail);
    void handleSendVideoChatMessage(UserChatRequest userChatRequest);
}
