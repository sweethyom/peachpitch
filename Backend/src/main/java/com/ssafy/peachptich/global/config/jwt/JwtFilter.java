package com.ssafy.peachptich.global.config.jwt;

import com.ssafy.peachptich.dto.CustomUserDetails;
import com.ssafy.peachptich.entity.User;
import com.ssafy.peachptich.repository.UserRepository;
import com.ssafy.peachptich.service.CustomUserDetailsService;
import com.ssafy.peachptich.service.TokenBlacklistService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.security.servlet.PathRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

@RequiredArgsConstructor
@Slf4j
public class JwtFilter extends OncePerRequestFilter {

    private final TokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final TokenBlacklistService tokenBlacklistService;

    // 토큰 검증 결과를 건너뛸 API URL들
    // private final List<String> excludedPaths = Arrays.asList("/login", "/join");
    private final List<String> excludedPaths = Arrays.asList(
            "/login",
            "/join",
            "/api/users/login/social",
            "/login/oauth2/code",
            "/oauth2/authorization",
            "/oauth2/token",
            "/oauth2/userinfo",
            "/api/main/randomscript"
    );


    @Override
    // 로그인, 회원가입 API URL이 포함되는지 확인하는 함수
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException{
        String path = request.getRequestURI();
        return (path.equals("/") || excludedPaths.stream().anyMatch(path::startsWith));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException{
        // 헤더에서 access 키에 담긴 토큰을 꺼냄
        String accessToken = request.getHeader("access");
        log.info("JWTFilter에서 accessToken = " + accessToken);

        // OAuth2 관련 경로는 JWT 검증 건너뛰기
        String requestURI = request.getRequestURI();
        log.info("JWTFilter에서 requestURI = " + requestURI);
        if (requestURI.startsWith("/api/users/login/social") ||
                requestURI.startsWith("/login/oauth2/code/") ||
                requestURI.startsWith("/api/users/coupon/*")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 토큰이 없다면 다음 필터로 넘김
        if (accessToken == null){
            filterChain.doFilter(request, response);
            return;
        }

        // 토큰이 blackList에 존재하는지 확인
        boolean isBlacked = tokenBlacklistService.isContainToken("BL:AT:" + accessToken);
        if(isBlacked) {
            PrintWriter writer = response.getWriter();
            writer.print("aleady logged out. Please sign in.");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        // 토큰 만료 여부 확인, 만료시 다음 필터로 넘기지 않음
        try {
            tokenProvider.isExpired(accessToken);
        } catch (ExpiredJwtException e) {
            // responseBody
            PrintWriter writer = response.getWriter();
            writer.print("access token expired");

            // response status code (상태 코드 응답)
            // HTTP 응답 코드 설정
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        // 토큰이 access인지 확인 (발급시 페이로드에 명시)
        String category = tokenProvider.getCategory(accessToken);

        if (!category.equals("access")){
            // responseBody
            PrintWriter writer = response.getWriter();
            writer.print("invalid access token");

            // response status code
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        // userEmail, role 값 획득
        String userEmail = tokenProvider.getUserEmail(accessToken);

        User userEntity = userRepository.findByEmail(userEmail).orElseThrow(() ->
                new UsernameNotFoundException("User not found with email: " + userEmail)
        );
        log.info("JWTFilter에서 userId = " + userEntity.getUserId() + ", userEmail = " + userEntity.getEmail() + ", role = " + userEntity.getRole() + ", birth = " + userEntity.getBirth());

        CustomUserDetails customUserDetails = new CustomUserDetails(userEntity);
        
        // Spring Security 인증 토큰 생성
        Authentication authToken = new UsernamePasswordAuthenticationToken(customUserDetails, null, customUserDetails.getAuthorities());

        // SecurityContextHolder에게 넘기면 일시적으로 세션이 생성됨 - 세션에 사용자 등록
        SecurityContextHolder.getContext().setAuthentication(authToken);

        // 검증 종료 후 다음 필터로 넘김
        filterChain.doFilter(request, response);
    }
}
