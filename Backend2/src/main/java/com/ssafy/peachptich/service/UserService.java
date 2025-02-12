package com.ssafy.peachptich.service;

import com.ssafy.peachptich.dto.request.JoinRequest;
import com.ssafy.peachptich.dto.response.ResponseDto;
import com.ssafy.peachptich.entity.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.util.Map;
import java.util.Optional;

public interface UserService {
    Optional<User> joinProcess(JoinRequest joinRequest);
    ResponseEntity<ResponseDto<Map<String, Object>>> withdrawProcess(HttpServletRequest request, HttpServletResponse response,
                                                                            Authentication authentication);

    ResponseEntity<ResponseDto<Map<String, Boolean>>> checkEmail(String email);
    Long getUserId(String email);
    String getUserEmail(Long userId);
}
