package com.ssafy.peachptich.controller;

import com.ssafy.peachptich.service.VideoChatService;
import io.openvidu.java.client.OpenViduHttpException;
import io.openvidu.java.client.OpenViduJavaClientException;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;


@Controller
@RequiredArgsConstructor
public class VideoChatWebSocketController {
    private final VideoChatService videoChatService;

    @MessageMapping("/request") // 클라이언트가 /pub/request로 header에 userId 담아서 보냄
    public synchronized void requestVideoChatRoom(
            @Header(value = "userId", required = false) Long userId
    ) throws OpenViduJavaClientException, OpenViduHttpException {
        videoChatService.handleVideoChatWebSocket(userId);
    }
}
