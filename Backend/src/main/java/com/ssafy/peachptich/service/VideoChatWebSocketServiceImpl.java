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
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;

@Service
@RequiredArgsConstructor
public class VideoChatWebSocketServiceImpl implements VideoChatWebSocketService {
    private final ChatHistoryService chatHistoryService;
    private final UserService userService;
    private final KeywordService keywordService;
    private final UserKeywordService userKeywordService;
    private final HintService hintService;
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
        Long userId = userService.getUserByEmail(userEmail).get().getUserId(); //현재 userId
        if (waitingUsers.isEmpty()) {
            //첫번째 사용자 대기열에 추가
            waitingUsers.add(userId);
            VideoChatRoomResponse waitingResponse = VideoChatRoomResponse.builder()
                    .status("waiting")
                    .build();
            messagingTemplate.convertAndSendToUser(userEmail, "/sub/call", waitingResponse);
            //messagingTemplate.convertAndSend("/sub/call/" + userId, ResponseEntity.ok(ResponseDto.of( "Waiting for another user to join", waitingResponse)));
        } else {
            //두번째 사용자가 들어오면 매칭 진행
            Long matchedUserId = waitingUsers.poll();
            //String matchedUserEmail = userRepository.findById(matchedUserId).get().getEmail();
            String matchedUserEmail = userService.getUserByUserId(matchedUserId).get().getEmail();
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
            //messagingTemplate.convertAndSend("/sub/call/" + matchedUserId, ResponseEntity.ok(ResponseDto.of("Waiting for another user to join", user1Response)));
            messagingTemplate.convertAndSendToUser(userEmail, "/sub/call", user2Response);
            //messagingTemplate.convertAndSend("/sub/call/" + userId, ResponseEntity.ok(ResponseDto.of("Waiting for another user to join", user2Response)));
        }
    }

    @Override
    public void handleVideoChatKeyword(AudioChatRequest videoChatRequest, Long historyId, String userEmail) {
        Long keywordId = videoChatRequest.getKeywordId();
        //Long historyId = videoChatRequest.getHistoryId();
        Long userId = userService.getUserByEmail(userEmail).get().getUserId(); //현재 userId
        String keyword = keywordService.getKeyword(keywordId);

        // 키워드 업데이트
        try {
            chatHistoryService.updateKeywordByUserId(historyId, userId, keywordId);
        } catch (IllegalArgumentException e) {
            // 유효하지 않은 사용자 또는 히스토리 처리
            return;
        }

        // user가 고른 키워드로 힌트 반환
        List<HintResponse> hints = hintService.getHints(keywordId);
        // 유저가 고른 키워드 추가
        userKeywordService.saveOrUpdate(userId, keywordId);
        // 대화 내역에 유저가 한 키워드 업데이트
        chatHistoryService.updateKeywordByUserId(historyId, userId, keywordId);

        // 업데이트된 채팅 내역을 한 번만 조회
        ChatHistory chatHistory = chatHistoryService.getChatHistory(historyId);

        ChatRoomResponse.ChatRoomResponseBuilder responseBuilder = ChatRoomResponse.builder()
                .hints(hints)
                .keyword(keyword)
                .historyId(historyId)
                .status("waiting"); // 기본적으로 'waiting' 상태

        // 두 명이 모두 키워드를 입력했는지 확인
        if (chatHistory.getKeyword1Id() != null && chatHistory.getKeyword2Id() != null) {
            responseBuilder.status("completed"); // 두 명 모두 입력 완료
        }

        ChatRoomResponse response = responseBuilder.build();

        // 방에 있는 둘에게 키워드 전송
        messagingTemplate.convertAndSend("/sub/chat/" + historyId, response);
    }

    // 세션 나가면 종료
    @Override
    public void closeSession(CloseRequest closeRequest) throws OpenViduJavaClientException, OpenViduHttpException {
        System.out.println("세션 종료");
        Session session = openvidu.getActiveSession(closeRequest.getSessionId());
        chatHistoryService.updateStatus(closeRequest.getHistoryId()); // 비활성화
        session.close();
    }
}
