package com.ssafy.peachptich.global.config.jwt;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.peachptich.dto.response.ResponseDto;
import com.ssafy.peachptich.repository.RefreshRepository;
import com.ssafy.peachptich.service.TokenBlacklistService;
import com.ssafy.peachptich.service.TokenListService;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.filter.GenericFilterBean;

import java.io.IOException;
import java.util.List;

@RequiredArgsConstructor
@Slf4j
public class CustomLogoutFilter extends GenericFilterBean {

    private final TokenProvider tokenProvider;
    private final TokenListService tokenListService;
    private final TokenBlacklistService tokenBlacklistService;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws ServletException, IOException {
        doFilter((HttpServletRequest) request, (HttpServletResponse) response, chain);
    }

    private void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        // path and method verify
        String requestUri = request.getRequestURI();

        // 로그아웃 관련 URI와 Http Method 설정
        if (!requestUri.matches("^\\/api/users/logout$")) {
            filterChain.doFilter(request, response);
            return;
        }

        String requestMethod = request.getMethod();
        if (!requestMethod.equals("POST")) {
            filterChain.doFilter(request, response);
            return;
        }

        // get refresh token
        String refresh = null;
        Cookie[] cookies = request.getCookies();
        for(Cookie cookie : cookies) {
            if(cookie.getName().equals("refresh")) {
                refresh = cookie.getValue();
                log.info("in CustomLogoutFilter, refresh token = " + refresh);
            }
        }

        // refresh null check
        if(refresh == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }

        // expired check
        try {
            tokenProvider.isExpired(refresh);
        } catch (ExpiredJwtException e) {
            // response status code
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }

        // 토큰이 refresh인지 확인 (발급시 페이로드에 명시)
        String category = tokenProvider.getCategory(refresh);
        if (!category.equals("refresh")) {
            // response status code
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }

        // Redis의 BlackList 내에 토큰이 존재하지 않는 경우
        /*
            if (!tokenBlacklistService.isContainToken(refresh)){
                // BlackList를 추가함
                tokenBlacklistService.addTokenToList(refresh);
                List<Object> blackList = tokenBlacklistService.getTokenBlackList();
                log.debug("blackList에 refresh 토큰 추가 -> blackList: " + blackList);

                // response status code
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                return;
            }
        */

        // redis에 저장되어 있는지 확인
        String userEmail = tokenProvider.getUserEmail(refresh);
        boolean isExist = tokenListService.isContainToken("RT:" + userEmail);
        if(!isExist){
            // response status code
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }
        
        // 로그아웃 진행
        // refresh token을 redis에서 제거
        tokenListService.removeToken("RT:" + userEmail);
        
        // access token을 blackList에 추가
        String access = request.getHeader("access");
        tokenBlacklistService.addTokenToList(access);
        
        /*
        // 여기부터 기존 코드
        // DB에 저장되어 있는지 확인
        Boolean isExist = refreshRepository.existsByRefresh(refresh);
        if (!isExist) {
            // response status code
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }

        // 로그아웃 진행
        // Refresh Token을 DB에서 제거
        refreshRepository.deleteByRefresh(refresh);
        
         */

        // Refresh Token Cookie 값 0 설정
        Cookie cookie = new Cookie("refresh", null);
        cookie.setMaxAge(0);
        cookie.setPath("/");

        // JSON 응답 생성
        ResponseDto<Void> responseDto = ResponseDto.<Void>builder()
                        .message("User logout success")
                        .data(null)
                        .build();

        // 응답 설정 및 전송
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.addCookie(cookie);
        response.setStatus(HttpServletResponse.SC_OK);

        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.writeValue(response.getWriter(), responseDto);
    }
}