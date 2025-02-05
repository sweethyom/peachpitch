package com.ssafy.peachptich.service;

import com.ssafy.peachptich.dto.response.RoomResponseDto;
import io.openvidu.java.client.OpenViduHttpException;
import io.openvidu.java.client.OpenViduJavaClientException;

public interface VideoChatService {
    RoomResponseDto handleVideoChat(Long userId) throws OpenViduHttpException, OpenViduJavaClientException;
}