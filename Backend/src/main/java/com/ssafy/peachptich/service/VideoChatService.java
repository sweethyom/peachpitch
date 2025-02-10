package com.ssafy.peachptich.service;

import com.ssafy.peachptich.dto.request.VideoChatRequest;
import com.ssafy.peachptich.dto.response.ChatRoomResponse;
import com.ssafy.peachptich.dto.response.VideoChatRoomResponse;
import io.openvidu.java.client.OpenViduHttpException;
import io.openvidu.java.client.OpenViduJavaClientException;

public interface VideoChatService {
    VideoChatRoomResponse handleVideoChat(Long userId) throws OpenViduHttpException, OpenViduJavaClientException;
    ChatRoomResponse getChatRoom(VideoChatRequest videoChatRequest, Long userId);
}