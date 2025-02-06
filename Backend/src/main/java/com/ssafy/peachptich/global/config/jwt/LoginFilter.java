//package com.ssafy.peachptich.global.config.jwt;
//
//import com.ssafy.peachptich.dto.CustomUserDetails;
//import jakarta.servlet.FilterChain;
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import lombok.RequiredArgsConstructor;
//import org.springframework.security.authentication.AuthenticationManager;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.AuthenticationException;
//import org.springframework.security.core.GrantedAuthority;
//import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
//
//import java.util.Collection;
//import java.util.Iterator;
//
//@RequiredArgsConstructor
//public class LoginFilter extends UsernamePasswordAuthenticationFilter {
//
//    private final AuthenticationManager authenticationManager;
//    private final TokenProvider tokenProvider;
//
//    protected String obtainEmail(HttpServletRequest request){
//        return request.getParameter("email");
//    }
//
//    @Override
//    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException {
//        String userEmail = obtainEmail(request);
//        String password = obtainPassword(request);
//        System.out.println("userEmail = " + userEmail);
//
//        // role 은 일단 null로!
//        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(userEmail, password, null);
//
//        // 데이터가 담긴 토큰을 검증을 위해 AuthenticationManager로 전달함
//        return authenticationManager.authenticate(authToken);
//    }
//
//    @Override
//    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain, Authentication authentication){
//        CustomUserDetails customUserDetails = (CustomUserDetails) authentication.getPrincipal();
//        String userEmail = customUserDetails.getUserEmail();
//
//        // 사용자의 role 데이터 추출
//        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
//        Iterator<? extends GrantedAuthority> iterator = authorities.iterator();
//        GrantedAuthority auth = iterator.next();
//        String role = auth.getAuthority();
//
//        // 시간 조절해야 함
//        String token = tokenProvider.createJwt(userEmail, role, 60*60*10L);
//
//        response.addHeader("Authorization", "Bearer " + token);
//    }
//
//
//    @Override
//    protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response, AuthenticationException failed){
//        // 로그인 실패 시 401 응답 코드 반환
//        response.setStatus(401);
//    }
//}
