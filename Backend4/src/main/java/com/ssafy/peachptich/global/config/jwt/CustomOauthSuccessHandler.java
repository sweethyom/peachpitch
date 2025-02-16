package com.ssafy.peachptich.global.config.jwt;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.peachptich.dto.CustomUserDetails;
import com.ssafy.peachptich.dto.response.ResponseDto;
import com.ssafy.peachptich.entity.Refresh;
import com.ssafy.peachptich.repository.RefreshRepository;
import com.ssafy.peachptich.service.TokenBlacklistService;
import com.ssafy.peachptich.service.TokenListService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
@Slf4j
public class CustomOauthSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private final TokenProvider tokenProvider;
    private final TokenListService tokenListService;
    private final TokenBlacklistService tokenBlacklistService;
    private final RedisTemplate<String, String> redisTemplate;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException{
        // OAuth2User
        CustomUserDetails customUserDetails = (CustomUserDetails) authentication.getPrincipal();

        String userEmail = customUserDetails.getName();
        Long userId = customUserDetails.getUserId();

        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        Iterator<? extends GrantedAuthority> iterator = authorities.iterator();
        GrantedAuthority auth = iterator.next();
        String role = auth.getAuthority();

        // Redis에 이미 발행된 refresh 토큰이 존재하는지 확인
        boolean hasExistingToken = tokenListService.isContainToken("RT:RT:" + userEmail);

        // 이미 발행된 토큰이 존재한다면
        if (hasExistingToken){
            String access = tokenListService.getToken("RT:AT:" + userEmail);
            if (access != null) {
                tokenBlacklistService.addTokenToList("BL:AT:" + access);
            }
            tokenListService.removeToken("RT:AT:" + userEmail);
            tokenListService.removeToken("RT:RT:" + userEmail);
        }

        // 새로운 토큰 발행
        String access = tokenProvider.createJwt("access", userEmail, role, 60*60*60L);
        String refresh = tokenProvider.createJwt("refresh", userEmail, role, 24*60*60L);
        
        // redis에 access token과 refresh token 저장
        try{
            addToken("RT:AT:" + userEmail, access, 60*60*60L);
            addToken("RT:RT:" + userEmail, refresh, 86400000L);
        } catch (Exception e){
            throw new CustomLoginFilter.TokenStorageException("Faied to store refresh token: " + e.getMessage());
        }

        System.out.println("oauth handler");

        // JSON 응답 생성
        log.info("in CustomOauthSuccessHandler, Json 응답 생성");
        Map<String, String> responseData = new HashMap<>();
        responseData.put("accessToken", access);  // access 토큰 값 추가
        ResponseDto<Map<String, String>> responseDto = ResponseDto.<Map<String, String>>builder()
                .message("User login success!")
                .data(responseData)
                .build();

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("access", access);
        response.addCookie(createCookie("refresh", refresh));
        //response.sendRedirect("http://localhost:5173/main");        // redirect 주소

        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.writeValue(response.getWriter(), responseDto);


        /*
        // 팝업 창에서 부모 창으로 메시지 전송 후 닫기
        response.setContentType("text/html;charset=UTF-8");
        response.setHeader("access", access);
        response.addCookie(createCookie("refresh", refresh));
        response.getWriter().println("<!DOCTYPE html>");
        response.getWriter().println("<html>");
        response.getWriter().println("<body>");
        response.getWriter().println("<script>");
        response.getWriter().println("window.opener.postMessage({");
        response.getWriter().println("  status: 'success',");
        response.getWriter().println("  access: '" + access + "',");
        response.getWriter().println("  email: '" + userEmail + "',");
        response.getWriter().println("  userId: '" + userId + "'");
        response.getWriter().println("}, '" + request.getHeader("Origin") + "');");

        response.getWriter().println("setTimeout(() => { window.close(); }, 300);"); // 메시지 전송 후 500ms 대기 후 닫기
        response.getWriter().println("</script>");
        response.getWriter().println("</body>");
        response.getWriter().println("</html>");

        response.sendRedirect("http://localhost:5173/main");
         */
    }

    private Cookie createCookie(String key, String value){
        Cookie cookie = new Cookie(key, value);
        cookie.setMaxAge(60*60*60);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setHttpOnly(false);

        return cookie;
    }

    private void addToken(String key, String value, Long expiredMs) {
        redisTemplate.opsForValue().set(
            key,                    // key 값
            value,                // value
            System.currentTimeMillis() + expiredMs,     // 만료 시간
            TimeUnit.MICROSECONDS
        );
    }
}
