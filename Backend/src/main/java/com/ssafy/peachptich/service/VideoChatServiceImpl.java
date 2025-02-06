package com.ssafy.peachptich.service;

import com.ssafy.peachptich.dto.response.RoomResponseDto;
import com.ssafy.peachptich.entity.RandomName;
import io.openvidu.java.client.*;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class VideoChatServiceImpl implements VideoChatService {
    private final ChatHistoryService chatHistoryService;
    private final RandomName randomName;
    private OpenVidu openvidu;

    @Value("${OPENVIDU_URL}")
    private String OPENVIDU_URL;

    @Value("${OPENVIDU_SECRET}")
    private String OPENVIDU_SECRET;

    @PostConstruct
    public void init() {
        this.openvidu=new OpenVidu(OPENVIDU_URL, OPENVIDU_SECRET);
    }

    private final Map<String, Session> activeSessions = new HashMap<>();
    private Long waitingUserId = null; //첫 번째 요청 대기
    private String waitingSessionId = null;

        @Override //token, history id 반환
        public RoomResponseDto handleVideoChat(Long userId) throws OpenViduHttpException, OpenViduJavaClientException {
            if (waitingUserId==null) {
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
                Long historyId = chatHistoryService.addVideoChatHistory(matchedUserId, userId, randomName.getRandomName(), randomName.getRandomName());

                // 대기열 초기화
                waitingUserId = null;
                waitingSessionId = null;

                return RoomResponseDto.builder().
                        token(token)
                        .historyId(historyId)
                        .build();
            }
        }
}