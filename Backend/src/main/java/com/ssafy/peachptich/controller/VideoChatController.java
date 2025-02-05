package com.ssafy.peachptich.controller;

import com.ssafy.peachptich.dto.request.VideoChatRequestDto;
import com.ssafy.peachptich.dto.response.HintResponseDto;
import com.ssafy.peachptich.dto.response.ResponseDto;
import com.ssafy.peachptich.dto.response.RoomResponseDto;
import com.ssafy.peachptich.service.ChatHistoryServiceImpl;
import com.ssafy.peachptich.service.VideoChatService;
import io.openvidu.java.client.OpenViduHttpException;
import io.openvidu.java.client.OpenViduJavaClientException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class VideoChatController {
    private final VideoChatService videoChatService;

    @PostMapping("/api/chat/video/request")
    public ResponseEntity<ResponseDto<RoomResponseDto>> requestVideoChatRoom(
            @RequestHeader(value = "userId", required = false) Long userId
    ) throws OpenViduJavaClientException, OpenViduHttpException {
        // userId 가지고 대화내역에 추가 -> 추후 jwt 토큰으로 변경
        // 세션에 들어가거나 만드는 요청 전부 포함 -> 매칭 되면 token, 대화내역 id 반환
        RoomResponseDto result = videoChatService.handleVideoChat(userId);
        // 첫 번째 사용자 요청 시 (token과 historyId가 null)
        if (result.getToken() == null && result.getHistoryId() == null) {
            return ResponseEntity.ok(ResponseDto.of("Waiting for another user to join", result));
        }
        //두번째 사용자 요청
        return ResponseEntity.ok(ResponseDto.of("Video chat matched successfully",
                result));
    }
}
