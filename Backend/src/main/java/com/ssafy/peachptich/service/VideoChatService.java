package com.ssafy.peachptich.service;

import com.ssafy.peachptich.dto.response.RoomResponse;
import io.openvidu.java.client.OpenViduHttpException;
import io.openvidu.java.client.OpenViduJavaClientException;

public interface VideoChatService {
    RoomResponse handleVideoChat(Long userId) throws OpenViduHttpException, OpenViduJavaClientException;
    void handleVideoChatWebSocket(Long userId) throws OpenViduHttpException, OpenViduJavaClientException;
}