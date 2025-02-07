package com.ssafy.peachptich.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.peachptich.dto.CustomUserDetails;
import com.ssafy.peachptich.dto.request.JoinRequest;
import com.ssafy.peachptich.dto.response.ApiResponse;
import com.ssafy.peachptich.entity.HaveCoupon;
import com.ssafy.peachptich.entity.User;
import com.ssafy.peachptich.global.config.jwt.TokenProvider;
import com.ssafy.peachptich.repository.HaveCouponRepository;
import com.ssafy.peachptich.repository.RefreshRepository;
import com.ssafy.peachptich.repository.UserRepository;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.antlr.v4.runtime.Token;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final RefreshRepository refreshRepository;
    private final HaveCouponRepository haveCouponRepository;
    private final TokenProvider tokenProvider;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    public Optional<User> joinProcess(JoinRequest joinRequest) {
        String userEmail = joinRequest.getEmail();
        log.info("joinProcess(), userEmail = " + userEmail);

        String password = joinRequest.getPassword();
        LocalDate birth = joinRequest.getBirth();

        Boolean isExist = userRepository.existsByEmail(userEmail);

        if (isExist) {
            return Optional.empty();
        }

        User data = new User();
        data.setEmail(userEmail);
        data.setPassword(bCryptPasswordEncoder.encode(password));
        data.setBirth(birth);
        data.setRole("ROLE_USER");
        data.setStatus(true);

        User savedUser = userRepository.save(data);

        log.info("successfully data saved!");
        return Optional.of(savedUser);
    }

    @Override
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> withdrawProcess(HttpServletRequest request, HttpServletResponse response,
                                                                            Authentication authentication) {          // 회원 탈퇴
        try {
            CustomUserDetails customUserDetails = (CustomUserDetails) authentication.getPrincipal();
            String userEmail = customUserDetails.getUserEmail();

            // get refresh token
            String refresh = null;
            Cookie[] cookies = request.getCookies();
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals("refresh")) {
                    refresh = cookie.getValue();
                }
            }

            // refresh null check
            if (refresh == null) {
                // 응답 메시지와 데이터를 포함한 ApiResponse 생성
                Map<String, Object> responseData = new HashMap<>();
                responseData.put("error", "The refresh token does not exist.");

                ApiResponse<Map<String, Object>> apiResponse = new ApiResponse<>(
                        "Bad Request: The refresh token does not exist",
                        responseData
                );

                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(apiResponse);
            }

            // expired check
            try {
                tokenProvider.isExpired(refresh);
            } catch (ExpiredJwtException e) {
                // 응답 메시지와 데이터를 포함한 ApiResponse 생성
                Map<String, Object> responseData = new HashMap<>();
                responseData.put("error", "refresh token is expired.");

                ApiResponse<Map<String, Object>> apiResponse = new ApiResponse<>(
                        "Bad Request: The refresh token is expired",
                        responseData
                );

                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(apiResponse);
            }

            // 토큰이 refresh인지 확인
            String category = tokenProvider.getCategory(refresh);
            if (!category.equals("refresh")) {
                // 응답 메시지와 데이터를 포함한 ApiResponse 생성
                Map<String, Object> responseData = new HashMap<>();
                responseData.put("error", "invalid token category");

                ApiResponse<Map<String, Object>> apiResponse = new ApiResponse<>(
                        "Bad Request: Token category is not 'refresh'",
                        responseData
                );

                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(apiResponse);
            }

            // DB에 저장되어 있는지 확인
            Boolean isExist = refreshRepository.existsByRefresh(refresh);
            if (!isExist) {
                // 응답 메시지와 데이터를 포함한 ApiResponse 생성
                Map<String, Object> responseData = new HashMap<>();
                responseData.put("error", "refresh token is not available.");

                ApiResponse<Map<String, Object>> apiResponse = new ApiResponse<>(
                        "Bad Request: The token does not exist in database",
                        responseData
                );

                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(apiResponse);
            }

            // refresh Token을 DB에서 제거
            refreshRepository.deleteByRefresh(refresh);

            // 회원 상태(status) false 전환
            User userEntity = userRepository.findByEmail(userEmail).get();
            userEntity.setStatus(false);

            // Refresh Token Cookie 값 0
            Cookie cookie = new Cookie("refresh", null);
            cookie.setMaxAge(0);
            cookie.setPath("/");

            // 사용자가 가진 쿠폰 수 조회
            HaveCoupon haveCoupon = haveCouponRepository.findByUser(userEntity);

            // JSON 응답 생성
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("email", userEmail);
            responseData.put("coupon", haveCoupon.getEa());
            responseData.put("status", false);
            responseData.put("deletedAt", LocalDateTime.now());

            ApiResponse<Map<String, Object>> apiResponse = new ApiResponse<>(
                    "Withdraw user success.",
                    responseData);

            return ResponseEntity.ok(apiResponse);

        } catch (Exception e) {
            log.error("Unexpected error during authentication", e);

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("error", "Unexpected error during authentication");

            ApiResponse<Map<String, Object>> apiResponse = new ApiResponse<>(
                    "Bad Request: Unexpected error during authentication",
                    responseData
            );
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(apiResponse);
        }
        // @Transactional 어노테이션을 사용하여 JPA가 트랜잭션 내에서 자동으로 변경 사항을 flush하여 DB에 반영함

    }
}
