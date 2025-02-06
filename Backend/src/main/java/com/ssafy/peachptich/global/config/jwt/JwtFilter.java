//package com.ssafy.peachptich.global.config.jwt;
//
//import com.ssafy.peachptich.dto.CustomUserDetails;
//import com.ssafy.peachptich.entity.User;
//import io.jsonwebtoken.JwtException;
//import jakarta.servlet.FilterChain;
//import jakarta.servlet.ServletException;
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.boot.autoconfigure.security.servlet.PathRequest;
//import org.springframework.context.annotation.Bean;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.GrantedAuthority;
//import org.springframework.security.core.authority.SimpleGrantedAuthority;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.web.filter.OncePerRequestFilter;
//
//import java.io.IOException;
//import java.util.Arrays;
//import java.util.Collection;
//import java.util.Collections;
//import java.util.List;
//
//@RequiredArgsConstructor
//@Slf4j
//public class JwtFilter extends OncePerRequestFilter {
//
//    private final TokenProvider tokenProvider;
//
//    // 토큰 검증 결과를 건너뛸 API URL들
//    private final List<String> excludedPaths = Arrays.asList("/login", "/join");
//
//    @Override
//    // 로그인, 회원가입 API URL이 포함되는지 확인하는 함수
//    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException{
//        String path = request.getRequestURI();
//        System.out.println((path.equals("/") || excludedPaths.stream().anyMatch(path::startsWith)));
//        return (path.equals("/") || excludedPaths.stream().anyMatch(path::startsWith));
//    }
//
//    @Override
//    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException{
//        try{
//            String authorization = request.getHeader("Authorization");
//
//            if(authorization == null || !authorization.startsWith("Bearer")){
//                throw new JwtException("access token is null");
//            }
//
//            // Bearer 문자열 제거 후 순수 토큰 획득
//            String token = authorization.split(" ")[1];
//
//            // 토큰 소멸 시간 검증
//            if (tokenProvider.isExpired(token)){
//                throw new JwtException("token expired");
//            }
//
//            String userEmail = tokenProvider.getUserEmail(token);
//            String role = tokenProvider.getRole(token);
//
//            // SimpleGrantedAuthority 생성 -> 권한에 관한 구현체
//            SimpleGrantedAuthority authority = new SimpleGrantedAuthority(role);
//            Collection<GrantedAuthority> authorities = Collections.singletonList(authority);
//
//            User userEntity = new User();
//            userEntity.setEmail(userEmail);
//            userEntity.setPassword("temp");
//            userEntity.setRole(role);
//
//            CustomUserDetails customUserDetails = new CustomUserDetails(userEntity);
//            Authentication authToken = new UsernamePasswordAuthenticationToken(customUserDetails, null, customUserDetails.getAuthorities());
//
//            // Session에 사용자 등록
//            SecurityContextHolder.getContext().setAuthentication(authToken);
//            filterChain.doFilter(request, response);
//
//        } catch(JwtException ex){
//            logger.info("Failed to authorize/authenticate with JWT due to " + ex.getMessage());
//        }
//    }
//}
