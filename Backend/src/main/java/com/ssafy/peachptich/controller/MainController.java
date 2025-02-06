package com.ssafy.peachptich.controller;

import com.ssafy.peachptich.dto.CustomUserDetails;
import com.ssafy.peachptich.entity.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.stream.Collectors;

@RestController
public class MainController {
//    @GetMapping("/api/main")
//    public String mainP(@AuthenticationPrincipal Optional<User> user){
//        System.out.println("MainController 입성");
//        System.out.println(user);               // 이게 왜 null로 뜨지
//
//        if(user != null) {
//            // 인증된 사용자가 있는 경우
//            // 세션 현재 사용자 아이디
//            String name = user.get().getEmail();
//
//            // 세션 현재 사용자 role
//            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//
//            Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
//            Iterator<? extends GrantedAuthority> iter = authorities.iterator();
//            GrantedAuthority auth = iter.next();
//            String role = auth.getAuthority();
//            return "Main Controller: " + name + ", " + role;
//        } else {
//            // 인증된 사용자가 아닌 경우
//            return "Main Controller: 로그인되지 않은 사용자";
//        }
//    }

    @GetMapping("/api/main")
    public ResponseEntity<Map<String, Object>> mainP(@AuthenticationPrincipal CustomUserDetails userDetails){
        Map<String, Object> response = new HashMap<>();
        System.out.println("MainController 입성");
        System.out.println(userDetails);

        if(userDetails != null) {
            // 인증된 사용자가 있는 경우
            response.put("isAuthenticated", true);
            response.put("email", userDetails.getUserEmail());
            response.put("birth", userDetails.getBirth());
            response.put("role", userDetails.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList()));
        } else {
            response.put("isAuthenticated", false);
            response.put("message", "Not authenticated user");
        }

        return ResponseEntity.ok(response);
    }
}
