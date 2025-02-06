package com.ssafy.peachptich.global.config.jwt;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.peachptich.dto.CustomUserDetails;
import com.ssafy.peachptich.dto.request.LoginRequest;
import com.ssafy.peachptich.entity.Refresh;
import com.ssafy.peachptich.entity.User;
import com.ssafy.peachptich.repository.RefreshRepository;
import com.ssafy.peachptich.repository.UserRepository;
import io.micrometer.common.util.StringUtils;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.IOException;
import java.util.*;

//@RequiredArgsConstructor
@Slf4j
public class CustomLoginFilter extends UsernamePasswordAuthenticationFilter {

    private final TokenProvider tokenProvider;
    private final RefreshRepository refreshRepository;
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private static final AntPathRequestMatcher CUSTOM_LOGIN_PATH_MATCHER = new AntPathRequestMatcher("/api/users/login", "POST");

//    @PostConstruct          // 초기화 로직 작성
//    public void initialize(){
//        setRequiresAuthenticationRequestMatcher(CUSTOM_LOGIN_PATH_MATCHER);
//        setAuthenticationManager(authenticationManager);
//    }

    public CustomLoginFilter(AuthenticationManager authenticationManager, TokenProvider tokenProvider, UserRepository userRepository,
                             RefreshRepository refreshRepository, AuthenticationManager authenticationManager1){
        // 부모 클래스의 생성자를 통해 AuthenticationManager 설정
        super(authenticationManager);
        this.tokenProvider = tokenProvider;
        this.refreshRepository = refreshRepository;
        this.userRepository = userRepository;
        this.authenticationManager = authenticationManager1;
        setRequiresAuthenticationRequestMatcher(CUSTOM_LOGIN_PATH_MATCHER);
    }

    protected String obtainEmail(HttpServletRequest request){
        return request.getParameter("email");
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException {
        // 요청 본문(JSON)을 DTO로 변환
        ObjectMapper objectMapper = new ObjectMapper();
        LoginRequest loginRequest;
        try {
            loginRequest = objectMapper.readValue(request.getInputStream(), LoginRequest.class);
        } catch (IOException e) {
            log.error("Failed to parse login request", e);

            throw new AuthenticationServiceException("Invalid login request format", e);
        }

        String userEmail = loginRequest.getEmail();
        String password = loginRequest.getPassword();

        log.info("로그인 시도 userEmail = " + userEmail);

        // 입력값 검증
        if (StringUtils.isEmpty(userEmail) || StringUtils.isEmpty(password)) {
            throw new BadCredentialsException("Email and password must not be empty.");
        }

        // 이메일 마스킹 후 로깅 (보안상)
        String maskedEmail = maskEmail(userEmail);
        log.info("Login attempt for user: {}", maskedEmail);

        // 탈퇴한 회원인지 확인
        try{
            User userEntity = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + maskedEmail));

            if (!userEntity.getStatus()) {
                throw new DisabledException("Account is deactivated. Please contact support.");
            }

            // 탈퇴한 회원이 아니라면 role 은 일단 null로!
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(userEmail, password, null);

            // 데이터가 담긴 토큰을 검증을 위해 AuthenticationManager로 전달함
            return authenticationManager.authenticate(authToken);

        } catch (Exception e){
            log.error("Authentication failed for user: {}", maskedEmail, e);
            throw e;
        }
    }

    private String maskEmail(String email){
        if (email == null || email.length() < 4)
            return "***";

        return email.substring(0, 2) + "***" + email.substring(email.length() - 2);
    }


    @Override
    @ResponseBody
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response,
                                            FilterChain chain, Authentication authentication){
        //TODO
        // authentication.getEmail()로 바꿀 필요 없을 것 같은데..?
        CustomUserDetails customUserDetails = (CustomUserDetails) authentication.getPrincipal();
        String userEmail = customUserDetails.getUserEmail();
        Long userId = customUserDetails.getUserId();

        // 사용자의 role 데이터 추출
        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        Iterator<? extends GrantedAuthority> iterator = authorities.iterator();
        GrantedAuthority auth = iterator.next();

        String role = auth.getAuthority();

        // 토큰 생성
        String access = tokenProvider.createJwt("access", userEmail, role, 600000L);
        String refresh = tokenProvider.createJwt("refresh", userEmail, role, 86400000L);

        try {
            // refresh Token 서버 저장
            addRefresh(userEmail, refresh, 86400000L);
        } catch (Exception e) {
            throw new TokenStorageException("Failed to store refresh token: " + e.getMessage());
        }

        // JSON 응답 생성
        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("message", "User login success");
        responseBody.put("data", Map.of("userId", userId));

        try {
            // 응답 설정
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.setStatus(HttpStatus.OK.value());

            // JSON 응답 반환
            ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.writeValue(response.getWriter(), responseBody);
        } catch (IOException e) {
            throw new ResponseWriteException("Failed to write response: " + e.getMessage());
        }

    }

    private Cookie createCookie(String key, String value){
        Cookie cookie = new Cookie(key, value);
        cookie.setMaxAge(24*60*60);     // 쿠키 생명 주기
         cookie.setSecure(true);        // https 통신을 진행해야 하는 경우
        // cookie.setPath("/");         // 쿠키가 적용될 범위
        cookie.setHttpOnly(true);       // true: 클라이언트단에서 javascript로 해당 쿠키에 접근하지 못하게 막아줌

        return cookie;
    }


    private void addRefresh(String userEmail, String refresh, Long expiredMs) {
        Date date = new Date(System.currentTimeMillis() + expiredMs);

        Refresh refreshEntity = new Refresh();
        refreshEntity.setUserEmail(userEmail);
        refreshEntity.setRefresh(refresh);
        refreshEntity.setExpiration(date.toString());

        refreshRepository.save(refreshEntity);
    }

    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response, AuthenticationException failed){
        // 로그인 실패 시 401 응답 코드 반환
        response.setStatus(401);
    }

    public static class TokenStorageException extends RuntimeException {
        public TokenStorageException(String message) {
            super(message);
        }
    }

    public static class ResponseWriteException extends RuntimeException {
        public ResponseWriteException(String message) {
            super(message);
        }
    }
}
