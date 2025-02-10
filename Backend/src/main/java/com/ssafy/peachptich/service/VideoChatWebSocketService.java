package com.ssafy.peachptich.service;

import io.openvidu.java.client.OpenViduHttpException;
import io.openvidu.java.client.OpenViduJavaClientException;

public interface VideoChatWebSocketService {
    void handleVideoChatWebSocket(String userEmail) throws OpenViduHttpException, OpenViduJavaClientException;
}
