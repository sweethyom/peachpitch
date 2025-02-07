package com.ssafy.peachptich.service;

import com.ssafy.peachptich.dto.response.ResponseDto;
import com.ssafy.peachptich.dto.response.RoomResponseDto;
import com.ssafy.peachptich.entity.RandomName;
import io.openvidu.java.client.*;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;

@Service
@Slf4j
@RequiredArgsConstructor
public class VideoChatServiceImpl implements VideoChatService {
    private final ChatHistoryService chatHistoryService;
    private final RandomName randomName;
    private OpenVidu openvidu;
    private final SimpMessagingTemplate messagingTemplate;
    private final Map<String, Session> activeSessions = new HashMap<>();
    private final Queue<Long> waitingUsers = new ConcurrentLinkedQueue<>();
    private Long waitingUserId = null; //첫 번째 요청 대기
    private String waitingSessionId = null;

    @Value("${OPENVIDU_URL}")
    private String OPENVIDU_URL;

    @Value("${OPENVIDU_SECRET}")
    private String OPENVIDU_SECRET;


    @PostConstruct
    public void init() {
        this.openvidu = new OpenVidu(OPENVIDU_URL, OPENVIDU_SECRET);
    }

    //대기큐 방식
    @Override //token, history id 반환
    public RoomResponseDto handleVideoChat(Long userId) throws OpenViduHttpException, OpenViduJavaClientException {
        if (waitingUserId == null) {
            //첫번째 사용자가 요청하면 대기상태로 저장,
            String sessionId = "session_" + userId;
            Session session = openvidu.createSession();
            activeSessions.put(sessionId, session);
            ConnectionProperties properties = new ConnectionProperties.Builder().build();
            String token = session.createConnection(properties).getToken();

            // 첫 번째 사용자의 정보를 저장
            waitingUserId = userId;
            waitingSessionId = sessionId; // 세션 ID 저장

            return RoomResponseDto.builder()
                    .status("waiting")
                    .token(token)  // 첫 번째 사용자에게도 토큰 제공
                    .historyId(null)  // 대화 내역 ID는 아직 없음
                    .build();
        } else {
            String sessionId = waitingSessionId;
            Session session = activeSessions.get(sessionId); // 대기중인 세션 가져오기

            ConnectionProperties properties = new ConnectionProperties.Builder().build();
            String token = session.createConnection(properties).getToken();

            Long matchedUserId = waitingUserId; //첫번째로 들어온 사용자 ID 저장
            // 대화 내역 생성
            String matchedUserName = randomName.getRandomName(); //먼저 들어온 사람 이름
            String userName = randomName.getRandomName(); //늦게 들어온 사람 이름
            Long historyId = chatHistoryService.addVideoChatHistory(matchedUserId, userId, matchedUserName, userName);

            // 대기열 초기화
            waitingUserId = null;
            waitingSessionId = null;

            return RoomResponseDto.builder()
                    .status("matched")
                    .token(token)
                    .historyId(historyId)
                    .build();
        }
    }

    //웹소켓 방식
    @Override
    public void handleVideoChatWebSocket(Long userId) throws OpenViduHttpException, OpenViduJavaClientException {

        if (waitingUsers.isEmpty()) {
            //첫번째 사용자 대기열에 추가
            waitingUsers.add(userId);
            RoomResponseDto waitingResponse = RoomResponseDto.builder()
                    .status("waiting")
                    .build();
            //messagingTemplate.convertAndSendToUser(String.valueOf(userId), "/sub/call", waitingResponse);
            messagingTemplate.convertAndSend("/sub/call/" + userId, ResponseEntity.ok(ResponseDto.of("Waiting for another user to join", waitingResponse)));
        } else {
            //두번째 사용자가 들어오면 매칭 진행
            Long matchedUserId = waitingUsers.poll();

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

            RoomResponseDto user1Response = RoomResponseDto.builder()
                    .token(token1)
                    .status("matched")
                    .historyId(historyId)
                    .userName(matchedUserName)
                    .matchedUserName(userName)
                    .build();

            RoomResponseDto user2Response = RoomResponseDto.builder()
                    .token(token2)
                    .status("matched")
                    .historyId(historyId)
                    .userName(userName)
                    .matchedUserName(matchedUserName)
                    .build();

            //추후 jwt인증으로 변경한다면 사용해야 하는 코드
            //messagingTemplate.convertAndSendToUser(String.valueOf(matchedUserId), "/sub/call", user1Response);
            messagingTemplate.convertAndSend("/sub/call/" + matchedUserId, ResponseEntity.ok(ResponseDto.of("Waiting for another user to join", user1Response)));
            //messagingTemplate.convertAndSendToUser(String.valueOf(userId), "/queue/call", user2Response);
            messagingTemplate.convertAndSend("/sub/call/" + userId, ResponseEntity.ok(ResponseDto.of("Waiting for another user to join", user2Response)));
        }
    }
}