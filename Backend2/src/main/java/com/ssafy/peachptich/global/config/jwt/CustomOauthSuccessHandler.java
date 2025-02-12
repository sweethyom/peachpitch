package com.ssafy.peachptich.global.config.jwt;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.peachptich.dto.CustomUserDetails;
import com.ssafy.peachptich.dto.response.ResponseDto;
import com.ssafy.peachptich.entity.Refresh;
import com.ssafy.peachptich.repository.RefreshRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.*;

@Component
@RequiredArgsConstructor
public class CustomOauthSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private final TokenProvider tokenProvider;
    private final RefreshRepository refreshRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException{

        // OAuth2User
        CustomUserDetails customUserDetails = (CustomUserDetails) authentication.getPrincipal();

        String userEmail = customUserDetails.getName();

        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        Iterator<? extends GrantedAuthority> iterator = authorities.iterator();
        GrantedAuthority auth = iterator.next();
        String role = auth.getAuthority();

        String access = tokenProvider.createJwt("access", userEmail, role, 60*60*60L);
        String refresh = tokenProvider.createJwt("refresh", userEmail, role, 24*60*60L);

        try{
            addRefresh(userEmail, refresh, 86400000L);
        } catch (Exception e){
            throw new CustomLoginFilter.TokenStorageException("Faied to store refresh token: " + e.getMessage());
        }

        // JSON 응답 생성
        Map<String, Long> responseData = new HashMap<>();
        ResponseDto<Map<String, Long>> responseDto = ResponseDto.<Map<String, Long>>builder()
                .message("User login success!")
                .data(responseData)
                .build();

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("access", access);
        response.addCookie(createCookie("refresh", refresh));
        response.sendRedirect("http://peachpitch.site/main");        // redirect 주소

        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.writeValue(response.getWriter(), responseDto);
    }

    private Cookie createCookie(String key, String value){
        Cookie cookie = new Cookie(key, value);
        cookie.setMaxAge(60*60*60);
        //cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setHttpOnly(true);

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
}
