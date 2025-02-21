package com.ssafy.peachptich.global;

import com.ssafy.peachptich.global.config.jwt.TokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

import java.security.Principal;

@RequiredArgsConstructor
@Component
@Slf4j
public class StompHandler implements ChannelInterceptor {
    private final TokenProvider tokenProvider;

    // websocket 요청이 처리 되기 전에 실행됨
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        log.info("stomp handler start");
        StompHeaderAccessor accessor = MessageHeaderAccessor
                .getAccessor(message, StompHeaderAccessor.class);
        //jwt토큰 유효성 검증
        if (StompCommand.CONNECT == accessor.getCommand()) {
            String accessToken = accessor.getFirstNativeHeader("access");

            if (accessToken == null || accessToken.isEmpty()) {
                throw new IllegalArgumentException("WebSocket 연결 요청에 access 토큰이 필요합니다.");
            }

            try {
                // 토큰 만료 여부 확인
                if (tokenProvider.isExpired(accessToken)) {
                    throw new IllegalArgumentException("만료된 access 토큰입니다.");
                }

                // 토큰 검증 후 사용자 이메일 추출
                String userEmail = tokenProvider.getUserEmail(accessToken);
                log.info("WebSocket 연결 요청: userEmail = {}", userEmail);

                // Principal 설정
                accessor.setUser(new Principal() {
                    @Override
                    public String getName() {
                        return userEmail;
                    }
                });

                log.info("STOMP User set: {}", userEmail);


            } catch (Exception e) {
                log.error("WebSocket 연결 중 JWT 검증 실패: {}", e.getMessage());
                throw new IllegalArgumentException("유효하지 않은 access 토큰입니다.");
            }
        }

        return message;
    }
}
