package com.ssafy.peachptich.service;

import com.ssafy.peachptich.dto.request.AudioChatRequest;
import com.ssafy.peachptich.dto.request.CloseRequest;
import com.ssafy.peachptich.dto.response.ChatRoomResponse;
import com.ssafy.peachptich.dto.response.HintResponse;
import com.ssafy.peachptich.dto.response.VideoChatRoomResponse;
import com.ssafy.peachptich.entity.ChatHistory;
import com.ssafy.peachptich.entity.RandomName;
import io.openvidu.java.client.*;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

@Service
@RequiredArgsConstructor
public class VideoChatWebSocketServiceImpl implements VideoChatWebSocketService {

    enum SessionType {
        MATCHING,
        KEYWORD
    }
    private final ChatHistoryService chatHistoryService;
    private final UserService userService;
    private final KeywordService keywordService;
    private final UserKeywordService userKeywordService;
    private final HintService hintService;
    private final RandomName randomName;

    private OpenVidu openvidu;
    private final SimpMessagingTemplate messagingTemplate;
    private final Queue<Long> waitingUsers = new ConcurrentLinkedQueue<>();
    private Map<String, SessionType> userSessions = new ConcurrentHashMap<>(); //지금 활성화된 웹소켓 세션

    // 매칭된 사용자와 관련된 채팅 히스토리 정보를 저장 (userId -> historyId)
    // private final Map<Long, Long> activeChatHistoryByUserId = new ConcurrentHashMap<>();
    // 채팅 히스토리별 오픈비듀 세션 정보를 저장 (historyId -> Session)
    // private final Map<Long, Session> activeSessionsByHistoryId = new ConcurrentHashMap<>();

    @Value("${OPENVIDU_URL}")
    private String OPENVIDU_URL;

    @Value("${OPENVIDU_SECRET}")
    private String OPENVIDU_SECRET;

    @PostConstruct
    public void init() {
        this.openvidu = new OpenVidu(OPENVIDU_URL, OPENVIDU_SECRET);
    }

    // 웹소켓 방식: 매칭 및 세션 생성
    @Override
    public synchronized void handleVideoChatWebSocket(String userEmail) throws OpenViduHttpException, OpenViduJavaClientException {
        Long userId = userService.getUserByEmail(userEmail).get().getUserId(); // 현재 userId
        if (waitingUsers.isEmpty()) {
            // 첫 번째 사용자는 대기열에 추가
            waitingUsers.add(userId);
            VideoChatRoomResponse waitingResponse = VideoChatRoomResponse.builder()
                    .status("waiting")
                    .build();
            messagingTemplate.convertAndSendToUser(userEmail, "/sub/call", waitingResponse);
        } else {
            // 두 번째 사용자가 들어오면 매칭 진행
            Long matchedUserId = waitingUsers.peek();
            if (matchedUserId.equals(userId)) {
                // 첫 번째 사용자랑 두 번째 사용자가 같음
                System.out.println("첫번째와 두번째가 같음");
                VideoChatRoomResponse waitingResponse = VideoChatRoomResponse.builder()
                        .status("waiting")
                        .build();
                messagingTemplate.convertAndSendToUser(userEmail, "/sub/call", waitingResponse);
            } else {
                waitingUsers.poll();
                String matchedUserEmail = userService.getUserByUserId(matchedUserId).get().getEmail();

                // 오픈비듀 세션 생성
                Session session = openvidu.createSession();

                // 각 사용자에게 토큰 발급
                Connection connection1 = session.createConnection();
                String token1 = connection1.getToken();

                Connection connection2 = session.createConnection();
                String token2 = connection2.getToken();

                // 대화 내역 생성 (채팅 히스토리 생성)
                String matchedUserName = randomName.getRandomName(); // 먼저 들어온 사람 이름
                String userName = randomName.getRandomName();        // 늦게 들어온 사람 이름
                Long historyId = chatHistoryService.addVideoChatHistory(matchedUserId, userId, matchedUserName, userName);

                // 매칭된 사용자와의 매핑정보 저장
                // activeChatHistoryByUserId.put(matchedUserId, historyId);
                // activeChatHistoryByUserId.put(userId, historyId);
                // activeSessionsByHistoryId.put(historyId, session);

                VideoChatRoomResponse user1Response = VideoChatRoomResponse.builder()
                        .token(token1)
                        .status("matched")
                        .historyId(historyId)
                        .userName(matchedUserName)
                        .matchedUserName(userName)
                        .build();

                VideoChatRoomResponse user2Response = VideoChatRoomResponse.builder()
                        .token(token2)
                        .status("matched")
                        .historyId(historyId)
                        .userName(userName)
                        .matchedUserName(matchedUserName)
                        .build();

                messagingTemplate.convertAndSendToUser(matchedUserEmail, "/sub/call", user1Response);
                messagingTemplate.convertAndSendToUser(userEmail, "/sub/call", user2Response);
            }
        }
    }

    @Override
    public synchronized void handleVideoChatKeyword(AudioChatRequest videoChatRequest, Long historyId, String userEmail) {
        Long keywordId = videoChatRequest.getKeywordId();
        Long userId = userService.getUserByEmail(userEmail).get().getUserId();
        String keyword = keywordService.getKeyword(keywordId);

        // 키워드 업데이트 (채팅 히스토리에 해당 유저의 키워드 기록)
        try {
            chatHistoryService.updateKeywordByUserId(historyId, userId, keywordId);
        } catch (IllegalArgumentException e) {
            // 유효하지 않은 사용자 또는 히스토리 처리
            return;
        }

        // 해당 키워드로 힌트 반환
        List<HintResponse> hints = hintService.getHints(keywordId);
        // 유저의 키워드 기록 업데이트
        userKeywordService.saveOrUpdate(userId, keywordId);
        // 채팅 히스토리에 키워드 업데이트
        chatHistoryService.updateKeywordByUserId(historyId, userId, keywordId);

        // 업데이트된 채팅 히스토리 조회
        ChatHistory chatHistory = chatHistoryService.getChatHistory(historyId);

        ChatRoomResponse.ChatRoomResponseBuilder responseBuilder = ChatRoomResponse.builder()
                .hints(hints)
                .keyword(keyword)
                .historyId(historyId)
                .status("waiting"); // 기본 상태

        // 두 명 모두 키워드 입력 시
        if (chatHistory.getKeyword1Id() != null && chatHistory.getKeyword2Id() != null) {
            responseBuilder.status("completed");
        }

        ChatRoomResponse response = responseBuilder.build();
        // 해당 채팅방(키워드 웹소켓)에 메시지 전송
        messagingTemplate.convertAndSend("/sub/chat/" + historyId, response);
    }

    @Override
    public synchronized void closeSession(CloseRequest closeRequest) throws OpenViduJavaClientException, OpenViduHttpException {
        System.out.println("closeRequest.getHistoryId() close= " + closeRequest.getHistoryId());

        Session session = openvidu.getActiveSession(closeRequest.getSessionId());

        try {
            if (session == null) {
                System.out.println("session already close " + closeRequest.getSessionId());
            } else {
                session.close();
                System.out.println("session close successfully: " + closeRequest.getSessionId());
            }
        }
        catch (Exception e) {
            String msg = e.getMessage();
            System.err.println("exception: " + msg);
            //e.printStackTrace();
        }
        finally {
            chatHistoryService.updateStatusFalse(closeRequest.getHistoryId());
        }
    }

    @Override
    public void handleVideoChatWebSocketDisconnect(String userEmail) {
        Long userId = userService.getUserByEmail(userEmail).orElseThrow().getUserId();
        System.out.println("handleVideoChatDisconnect: " + userEmail + " (userId=" + userId + ")");
        if (waitingUsers.remove(userId)) {
            System.out.println("remove from queue: " + userEmail);
        }
    }

}

