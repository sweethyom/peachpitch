package com.ssafy.peachptich.service;

import com.ssafy.peachptich.dto.CustomUserDetails;
import com.ssafy.peachptich.dto.request.AudioChatRequest;
import com.ssafy.peachptich.dto.request.TrialRequest;
import com.ssafy.peachptich.dto.response.ChatRoomResponse;

public interface AudioChatService {
    boolean isAvailable(TrialRequest trialRequest, CustomUserDetails userDetails);
    ChatRoomResponse getChatRoom(AudioChatRequest audioChatRequest, CustomUserDetails userDetails);
}
