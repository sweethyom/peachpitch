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
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

@Service
@RequiredArgsConstructor
public class VideoChatWebSocketServiceImpl implements VideoChatWebSocketService {
    @Builder
    @AllArgsConstructor
    @Getter
    public static class RoomInfo {
        Long historyId;
        SessionType sessionType;
        String sessionId;
    }

    enum SessionType {
        MATCHING,
        KEYWORD,
        OPENVIDU,
        TERMINATED
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
    private final Map<Set<String>, RoomInfo> roomMap = new ConcurrentHashMap<>(); // 매칭된 사용자들과 관련된 정보 저장
    private final Map<String, Set<String>> userRoomMap = new ConcurrentHashMap<>();  // 사용자 정보 저장


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

        System.out.println("=== active session  ===");
        System.out.println("roomMap status:");
        for (Map.Entry<Set<String>, RoomInfo> entry : roomMap.entrySet()) {
            System.out.println("Room Key: " + entry.getKey() + " -> RoomInfo: " + entry.getValue());
        }
        System.out.println("userRoomMap status:");
        for (Map.Entry<String, Set<String>> entry : userRoomMap.entrySet()) {
            System.out.println("User: " + entry.getKey() + " -> Room Key: " + entry.getValue());
        }
        // 이미 방에 참여 중이면 추가 처리 없이 응답 전송
        if (userRoomMap.containsKey(userEmail)) {
            System.out.println("already in room");
            VideoChatRoomResponse alreadyResponse = VideoChatRoomResponse.builder()
                    .status("already_in_room")
                    .build();
            messagingTemplate.convertAndSendToUser(userEmail, "/sub/call", alreadyResponse);
            return;
        }
        Long userId = userService.getUserByEmail(userEmail).get().getUserId(); // 현재 userId
        if (waitingUsers.isEmpty()) {
            // 첫 번째 사용자는 대기열에 추가, 아직 매칭 전
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
                VideoChatRoomResponse waitingResponse = VideoChatRoomResponse.builder()
                        .status("equal")
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

                // 매칭된 사용자와의 방 정보를 roomMap, userRoomMap에 저장
                Set<String> roomKey = new HashSet<>(Arrays.asList(userEmail, matchedUserEmail));
                RoomInfo roomInfo = RoomInfo.builder()
                        .historyId(historyId)
                        .sessionType(SessionType.MATCHING)
                        .sessionId(session.getSessionId())
                        .build();
                roomMap.put(roomKey, roomInfo);
                userRoomMap.put(userEmail, roomKey);
                userRoomMap.put(matchedUserEmail, roomKey);

                VideoChatRoomResponse user1Response = VideoChatRoomResponse.builder()
                        .token(token1)
                        .status("matched")
                        .userId(matchedUserId)
                        .historyId(historyId)
                        .userName(matchedUserName)
                        .matchedUserName(userName)
                        .matchedUserEmail(userEmail)
                        .build();

                VideoChatRoomResponse user2Response = VideoChatRoomResponse.builder()
                        .token(token2)
                        .status("matched")
                        .userId(userId)
                        .historyId(historyId)
                        .userName(userName)
                        .matchedUserName(matchedUserName)
                        .matchedUserEmail(matchedUserEmail)
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

        // RoomInfo 업데이트: 유저가 속한 방의 RoomInfo를 찾아 sessionType을 변경
        Set<String> roomKey = userRoomMap.get(userEmail);
        if (roomKey != null) {
            RoomInfo oldRoomInfo = roomMap.get(roomKey);
            if (oldRoomInfo != null) {
                RoomInfo updatedRoomInfo = RoomInfo.builder()
                        .historyId(oldRoomInfo.getHistoryId())
                        .sessionType(SessionType.KEYWORD)
                        .sessionId(oldRoomInfo.getSessionId())
                        .build();
                roomMap.put(roomKey, updatedRoomInfo);
            }
        }

        ChatRoomResponse.ChatRoomResponseBuilder responseBuilder = ChatRoomResponse.builder()
                .hints(hints)
                .keyword(keyword)
                .historyId(historyId)
                .status("waiting"); // 기본 상태

        // 두 명 모두 키워드 입력 시
        if (chatHistory.getKeyword1Id() != null && chatHistory.getKeyword2Id() != null) {
            if (roomKey != null) {
                RoomInfo oldRoomInfo = roomMap.get(roomKey);
                if (oldRoomInfo != null) {
                    RoomInfo updatedRoomInfo = RoomInfo.builder()
                            .historyId(oldRoomInfo.getHistoryId())
                            .sessionType(SessionType.OPENVIDU)
                            .sessionId(oldRoomInfo.getSessionId())
                            .build();
                    roomMap.put(roomKey, updatedRoomInfo);
                }
            }
            responseBuilder.status("completed");
        }

        ChatRoomResponse response = responseBuilder.build();
        // 해당 채팅방(키워드 웹소켓)에 메시지 전송
        messagingTemplate.convertAndSend("/sub/chat/" + historyId, response);
    }

    // 자동 종료, 나가기 버튼 눌러서 강제종료
    @Override
    public synchronized void handleCloseVideoChat(CloseRequest closeRequest, String userEmail) throws OpenViduJavaClientException, OpenViduHttpException {
        String sessionId = closeRequest.getSessionId();
        String matchedUserEmail = closeRequest.getMatchedUserEmail();
        String sessionEndType = closeRequest.getSessionEndType();

        System.out.println("sessionEndType = " + sessionEndType);
        System.out.println("matchedUserEmail = " + matchedUserEmail);
        if(sessionId != null) {
            Session session = openvidu.getActiveSession(sessionId);
            try {
                if (session == null) {
                    System.out.println("세션이 이미 종료되었습니다: " + closeRequest.getSessionId());
                } else {
                    session.close();
                    System.out.println("세션이 성공적으로 종료되었습니다: " + closeRequest.getSessionId());
                }
            }
            catch (Exception e) {
                String msg = e.getMessage();
                System.err.println("예외 발생: " + msg);
                if (msg.contains("404")){
                    System.out.println("세션이 이미 종료되었습니다: " + closeRequest.getSessionId());
                }
                else {
                    e.printStackTrace();
                }
            }
            finally {
                chatHistoryService.updateStatusFalse(closeRequest.getHistoryId());
            }
        }
        System.out.println("종료 요청");
        if (sessionEndType.equals("MANUAL")){
            //강제 종료.
            VideoChatRoomResponse manualResponse = VideoChatRoomResponse.builder()
                    .status("manual")
                    .build();
            messagingTemplate.convertAndSendToUser(matchedUserEmail, "/sub/call", manualResponse);
            //messagingTemplate.convertAndSendToUser(userEmail, "/sub/call", status);
        }
        else if (sessionEndType.equals("AUTO")){
            //자동 종료
            VideoChatRoomResponse autoResponse = VideoChatRoomResponse.builder()
                    .status("auto")
                    .build();
            messagingTemplate.convertAndSendToUser(matchedUserEmail, "/sub/call", autoResponse);
            messagingTemplate.convertAndSendToUser(userEmail, "/sub/call", autoResponse);
        }
        else if(sessionEndType.equals("ERROR")){
            // 에러
            String status = "error";
            messagingTemplate.convertAndSendToUser(userEmail, "/sub/call", status);
        }
        // 종료 후 방 매핑 정보 제거
        removeRoomMapping(userEmail);
        removeRoomMapping(matchedUserEmail);

    }

    // 뒤로가기 등으로 종료
    @Override
    public void handleVideoChatWebSocketDisconnect(String userEmail) {
        Long userId = userService.getUserByEmail(userEmail).orElseThrow().getUserId();
        System.out.println("handleVideoChatDisconnect: " + userEmail + " (userId=" + userId + ")");
        if (waitingUsers.remove(userId)) {
            System.out.println("대기열에서 사용자 제거: " + userEmail);
        }
        // 만약 해당 유저가 방에 속해 있다면, 그 방의 상대방에게 알림 전송 및 매핑 제거
        Set<String> roomKey = userRoomMap.get(userEmail);
        if (roomKey != null) {
            // 원본을 보호하기 위해 복사본 생성
            Set<String> roomKeyCopy = new HashSet<>(roomKey);
            roomKeyCopy.remove(userEmail);  // 나간 유저 제외
            RoomInfo roomInfo = roomMap.get(roomKey);
            String sessionId = roomInfo.getSessionId();
            if(roomInfo.getSessionType().equals(SessionType.MATCHING)
            || roomInfo.getSessionType().equals(SessionType.KEYWORD)) {
                System.out.println("강제 종료 요청 "+roomInfo.getSessionType()+" "+roomInfo.getSessionId());
                if(sessionId != null) {
                    Session session = openvidu.getActiveSession(sessionId);
                    try {
                        if (session == null) {
                            System.out.println("세션이 이미 종료되었습니다: " +sessionId);
                        } else {
                            session.close();
                            System.out.println("세션이 성공적으로 종료되었습니다: " +sessionId);
                        }
                    }
                    catch (Exception e) {
                        String msg = e.getMessage();
                        System.err.println("예외 발생: " + msg);
                        if (msg.contains("404")){
                            System.out.println("세션이 이미 종료되었습니다: " + sessionId);
                        }
                        else {
                            e.printStackTrace();
                        }
                    }
                    finally {
                        chatHistoryService.updateStatusFalse(roomInfo.getHistoryId());
                    }
                }
                // 다른 유저들에게 "disconnected" 상태 알림 전송
                for (String otherUserEmail : roomKeyCopy) {
                    System.out.println("otherUserEmail = " + otherUserEmail);
                    VideoChatRoomResponse disconnectResponse = VideoChatRoomResponse.builder()
                            .status("disconnected")
                            .build();
                    messagingTemplate.convertAndSendToUser(otherUserEmail, "/sub/call", disconnectResponse);
                }

                // 해당 방에 속한 모든 유저의 매핑 제거
                for (String email : new HashSet<>(roomKey)) {
                    userRoomMap.remove(email);
                }
                roomMap.remove(roomKey);
                //chatHistoryService.updateStatusFalse(roomInfo.getHistoryId()); //상태 변경
            }
        }
    }

    // 유저가 속한 방 매핑 정보 제거 (roomMap과 userRoomMap에서 삭제)
    private void removeRoomMapping(String userEmail) {
        Set<String> roomKey = userRoomMap.get(userEmail);
        if (roomKey != null) {
            // 해당 방에 속한 모든 유저의 매핑 제거
            for (String email : roomKey) {
                userRoomMap.remove(email);
            }
            roomMap.remove(roomKey);
        }
    }

}

