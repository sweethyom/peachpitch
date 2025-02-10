package com.ssafy.peachptich.service;

import com.ssafy.peachptich.dto.request.VideoChatRequest;
import com.ssafy.peachptich.dto.response.ChatRoomResponse;
import com.ssafy.peachptich.dto.response.HintResponse;
import com.ssafy.peachptich.dto.response.ResponseDto;
import com.ssafy.peachptich.dto.response.RoomResponse;
import com.ssafy.peachptich.entity.RandomName;
import com.ssafy.peachptich.repository.UserRepository;
import io.openvidu.java.client.*;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.query.sql.internal.ParameterRecognizerImpl;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;

@Service
@Slf4j
@RequiredArgsConstructor
public class VideoChatServiceImpl implements VideoChatService {
    private final ChatHistoryService chatHistoryService;
    private final KeywordService keywordService;
    private final UserService userService;
    private final HintService hintService;
    private final UserKeywordService userKeywordService;
    private final RandomName randomName;

    private OpenVidu openvidu;
    private final SimpMessagingTemplate messagingTemplate;
    private final Queue<Long> waitingUsers = new ConcurrentLinkedQueue<>();
    private Long waitingUserId = null; //첫 번째 요청 대기

    private final Map<String, Session> activeSessions = new HashMap<>();
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
    public RoomResponse handleVideoChat(Long userId) throws OpenViduHttpException, OpenViduJavaClientException {
        if (waitingUserId == null) {
            System.out.println("waitingUserId is null");
            //첫번째 사용자가 요청하면 대기상태로 저장,
            String sessionId = "session_" + userId;
            Session session = openvidu.createSession();
            System.out.println("sessionId = " + sessionId);
            activeSessions.put(sessionId, session);
            ConnectionProperties properties = new ConnectionProperties.Builder().build();
            String token = session.createConnection(properties).getToken();

            // 첫 번째 사용자의 정보를 저장
            waitingUserId = userId;
            waitingSessionId = sessionId; // 세션 ID 저장

            return RoomResponse.builder()
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

            return RoomResponse.builder()
                    .status("matched")
                    .token(token)
                    .historyId(historyId)
                    .build();
        }
    }

    @Override
    public ChatRoomResponse getChatRoom(VideoChatRequest videoChatRequest, Long userId) {
        Long keywordId = videoChatRequest.getKeywordId();
        Long historyId = videoChatRequest.getHistoryId();

        String keyword = keywordService.getKeyword(keywordId);
        // user가 고른 키워드로 힌트 반환
        List<HintResponse> hints = hintService.getHints(keywordId);
        // 유저가 고른 키워드 추가
        userKeywordService.saveOrUpdate(userId, keywordId);
        // 대화 내역에 유저가 한 키워드 업데이트
        chatHistoryService.updateKeywordByUserId(historyId, userId, keywordId);
        return ChatRoomResponse.builder()
                .hints(hints)
                .keyword(keyword)
                .historyId(historyId)
                .build();
    }
}