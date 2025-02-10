package com.ssafy.peachptich.service;

import com.ssafy.peachptich.dto.response.RoomResponse;
import com.ssafy.peachptich.entity.RandomName;
import io.openvidu.java.client.*;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;

@Service
@RequiredArgsConstructor
public class VideoChatWebSocketServiceImpl implements VideoChatWebSocketService {
    private final ChatHistoryService chatHistoryService;
    private final UserService userService;
    private final RandomName randomName;

    private OpenVidu openvidu;
    private final SimpMessagingTemplate messagingTemplate;
    private final Queue<Long> waitingUsers = new ConcurrentLinkedQueue<>();

    @Value("${OPENVIDU_URL}")
    private String OPENVIDU_URL;

    @Value("${OPENVIDU_SECRET}")
    private String OPENVIDU_SECRET;

    @PostConstruct
    public void init() {
        this.openvidu = new OpenVidu(OPENVIDU_URL, OPENVIDU_SECRET);
    }

    //웹소켓 방식
    @Override
    public void handleVideoChatWebSocket(String userEmail) throws OpenViduHttpException, OpenViduJavaClientException {
        Long userId = userService.getUserId(userEmail); //현재 userId
        if (waitingUsers.isEmpty()) {
            //첫번째 사용자 대기열에 추가
            waitingUsers.add(userId);
            RoomResponse waitingResponse = RoomResponse.builder()
                    .status("waiting")
                    .build();
            messagingTemplate.convertAndSendToUser(userEmail, "/sub/call", waitingResponse);
            //messagingTemplate.convertAndSend("/sub/call/" + userId, ResponseEntity.ok(ResponseDto.of( "Waiting for another user to join", waitingResponse)));
        } else {
            //두번째 사용자가 들어오면 매칭 진행
            Long matchedUserId = waitingUsers.poll();
            //String matchedUserEmail = userRepository.findById(matchedUserId).get().getEmail();
            String matchedUserEmail = userService.getUserEmail(matchedUserId);
            //오픈비듀 객체, 연결 생성
            Session session = openvidu.createSession();

            //각 사용자에게 개별적으로 토큰 발급
            Connection connection1 = session.createConnection();
            String token1 = connection1.getToken();

            Connection connection2 = session.createConnection();
            String token2 = connection2.getToken();

            //대화 내역 생성
            String matchedUserName = randomName.getRandomName(); //먼저 들어온 사람 이름
            String userName = randomName.getRandomName(); //늦게 들어온 사람 이름
            Long historyId = chatHistoryService.addVideoChatHistory(matchedUserId, userId, matchedUserName, userName);

            RoomResponse user1Response = RoomResponse.builder()
                    .token(token1)
                    .status("matched")
                    .historyId(historyId)
                    .userName(matchedUserName)
                    .matchedUserName(userName)
                    .build();

            RoomResponse user2Response = RoomResponse.builder()
                    .token(token2)
                    .status("matched")
                    .historyId(historyId)
                    .userName(userName)
                    .matchedUserName(matchedUserName)
                    .build();

            messagingTemplate.convertAndSendToUser(matchedUserEmail, "/sub/call", user1Response);
            //messagingTemplate.convertAndSend("/sub/call/" + matchedUserId, ResponseEntity.ok(ResponseDto.of("Waiting for another user to join", user1Response)));
            messagingTemplate.convertAndSendToUser(userEmail, "/sub/call", user2Response);
            //messagingTemplate.convertAndSend("/sub/call/" + userId, ResponseEntity.ok(ResponseDto.of("Waiting for another user to join", user2Response)));
        }
    }

}
