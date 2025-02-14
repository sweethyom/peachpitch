package com.ssafy.peachptich.controller.users;

import com.ssafy.peachptich.entity.Refresh;
import com.ssafy.peachptich.global.config.jwt.TokenProvider;
import com.ssafy.peachptich.repository.RefreshRepository;
import com.ssafy.peachptich.service.TokenListService;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@RestController
@RequiredArgsConstructor
public class ReissueController {
    private final TokenProvider tokenProvider;
    private final RefreshRepository refreshRepository;
    private final TokenListService tokenListService;
    private final RedisTemplate<String, String> redisTemplate;

    @PostMapping("/api/users/reissue")
    public ResponseEntity<?> reissue(HttpServletRequest request, HttpServletResponse response){
        // get refresh Token
        String refresh = null;
        Cookie[] cookies = request.getCookies();
        for (Cookie cookie: cookies) {
            if(cookie.getName().equals("refresh")){
                refresh = cookie.getValue();
            }
        }

        if (refresh == null) {
            // response status code
            return new ResponseEntity<>("refresh token null", HttpStatus.BAD_REQUEST);
        }

        // expired check
        try {
            tokenProvider.isExpired(refresh);
        } catch (ExpiredJwtException e) {
            // response status code
            return new ResponseEntity<>("refresh Token expired", HttpStatus.BAD_REQUEST);
        }

        // Token이 refresh인지 확인 (발급시 페이로드에 명시함)
        String category = tokenProvider.getCategory(refresh);
        if (!category.equals("refresh")) {
            // response status code
            return new ResponseEntity<>("invalid refresh token", HttpStatus.BAD_REQUEST);
        }

        String userEmail = tokenProvider.getUserEmail(refresh);
        String role = tokenProvider.getRole(refresh);

        // Redis에 저장되어 있는지 확인
        boolean isExist = tokenListService.isContainToken("RT:RT:" + userEmail);
        if(!isExist){
            // response body
            return new ResponseEntity<>("invalid refresh token", HttpStatus.BAD_REQUEST);
        }

        /* 기존 코드
        // DB에 저장되어 있는지 확인
        Boolean isExist = refreshRepository.existsByRefresh(refresh);
        if (!isExist) {
            // response body
            return new ResponseEntity<>("invalid refresh token", HttpStatus.BAD_REQUEST);
        }
         */

        // make new JWT
        String newAccess = tokenProvider.createJwt("access", userEmail, role, 600000L);
        String newRefresh = tokenProvider.createJwt("refresh", userEmail, role, 86400000L);

        // Refresh Token 저장
        // DB에 기존의 Refresh Token 삭제 후 새 Refresh Token 저장
        // refreshRepository.deleteByRefresh(refresh);
        // addToken(userEmail, newRefresh, 86400000L);

        addToken("RT:AT:" + userEmail, newAccess, 600000L);
        addToken("RT:RT:" + userEmail, newRefresh, 86400000L);

        // response
//        response.setHeader("access", newAccess);
        response.addCookie(createCookie("refresh", newRefresh));

        Map<String, String> responseBody = new HashMap<>();
        responseBody.put("accessToken", newAccess);
        responseBody.put("refreshToken", newRefresh);

        return new ResponseEntity<>(responseBody, HttpStatus.OK);
    }

    private Cookie createCookie(String key, String value){
        Cookie cookie = new Cookie(key, value);
        cookie.setMaxAge(24*60*60);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setHttpOnly(false);

        return cookie;
    }

    private void addToken(String key, String value, Long expiredMs) {
        redisTemplate.opsForValue().set(
                key,       // key 값
                value,                // value
                System.currentTimeMillis() + expiredMs,     // 만료 시간
                TimeUnit.MICROSECONDS
        );
    }

}
