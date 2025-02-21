package com.ssafy.peachptich.controller.users;

import com.ssafy.peachptich.entity.Refresh;
import com.ssafy.peachptich.global.config.jwt.TokenProvider;
import com.ssafy.peachptich.repository.RefreshRepository;
import com.ssafy.peachptich.service.TokenListService;
import io.jsonwebtoken.ExpiredJwtException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
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
import java.util.concurrent.TimeUnit;

@RestController
@RequiredArgsConstructor
@Tag(name = "ReissueController", description = "회원 관련 토큰 재발행 컨트롤러")
public class ReissueController {
    private final TokenProvider tokenProvider;
    private final RefreshRepository refreshRepository;
    private final TokenListService tokenListService;
    private final RedisTemplate<String, String> redisTemplate;

    // 매직 넘버 상수 정의
    private static final long ACCESS_TOKEN_EXPIRE_TIME = 82000000L;
    private static final long REFRESH_TOKEN_EXPIRE_TIME = 86400000L;

    @PostMapping("/api/users/reissue")
    @Operation(summary = "Access token 재발행", description = "refresh 토큰을 기반으로 access 토큰을 재발행합니다.",
    security = {@SecurityRequirement(name = "access"), @SecurityRequirement(name = "refresh")})
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "재발행 성공"),
            @ApiResponse(responseCode = "400", description = "refresh 토큰이 존재하지 않거나 유효하지 않음")
    })
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

        // make new JWT
        String newAccess = tokenProvider.createJwt("access", userEmail, role, ACCESS_TOKEN_EXPIRE_TIME);
        String newRefresh = tokenProvider.createJwt("refresh", userEmail, role, REFRESH_TOKEN_EXPIRE_TIME);
        
        addToken("RT:AT:" + userEmail, newAccess, ACCESS_TOKEN_EXPIRE_TIME);
        addToken("RT:RT:" + userEmail, newRefresh, REFRESH_TOKEN_EXPIRE_TIME);

        // response
        response.setHeader("access", newAccess);
        response.addCookie(createCookie("refresh", newRefresh));

        return new ResponseEntity<>(HttpStatus.OK);
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
