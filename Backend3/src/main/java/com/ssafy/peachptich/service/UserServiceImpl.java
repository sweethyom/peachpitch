package com.ssafy.peachptich.service;

import com.ssafy.peachptich.dto.CustomUserDetails;
import com.ssafy.peachptich.dto.request.JoinRequest;
import com.ssafy.peachptich.dto.response.ResponseDto;
import com.ssafy.peachptich.entity.HaveCoupon;
import com.ssafy.peachptich.entity.Item;
import com.ssafy.peachptich.entity.User;
import com.ssafy.peachptich.global.config.jwt.TokenProvider;
import com.ssafy.peachptich.repository.HaveCouponRepository;
import com.ssafy.peachptich.repository.ItemRepository;
import com.ssafy.peachptich.repository.RefreshRepository;
import com.ssafy.peachptich.repository.UserRepository;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final HaveCouponRepository haveCouponRepository;
    private final TokenProvider tokenProvider;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final TokenListService tokenListService;
//    private final TokenBlacklistService tokenBlacklistService;

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

        List<Item> items = itemRepository.findAll();

        for (Item item : items) {
            HaveCoupon haveCoupon = HaveCoupon.builder()
                    .user(savedUser)
                    .item(item)
                    .ea(0)
                    .build();
            haveCouponRepository.save(haveCoupon);
        }
        return Optional.of(savedUser);
    }

    @Override
    public ResponseEntity<ResponseDto<Map<String, Boolean>>> checkEmail(String email){
        log.info("여기 입력");
        Map<String, Boolean> responseData = new HashMap<>();

        Boolean exist = userRepository.findByEmail(email).isPresent();
        String message = null;

        if(exist){
            responseData.put("result", false);
            message = "The email is already subscribed to.";
        } else{
            responseData.put("result", true);
            message = "The email is available.";
        }

        return ResponseEntity.ok()
                .body(new ResponseDto<>(message, responseData));
    }


    @Override
    @Transactional
    public ResponseEntity<ResponseDto<Map<String, Object>>> withdrawProcess(HttpServletRequest request, HttpServletResponse response,
                                                                            Authentication authentication) {          // 회원 탈퇴
        try {
            CustomUserDetails customUserDetails = (CustomUserDetails) authentication.getPrincipal();
            String userEmail = customUserDetails.getUserEmail();

            // get refresh token
            String refresh = null;
            Cookie[] cookies = request.getCookies();
            log.info("in UserServiceImpl, cookies = " + cookies);
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals("refresh")) {
                    refresh = cookie.getValue();
                }
            }

            // refresh null check
            if (refresh == null) {
                // 응답 메시지와 데이터를 포함한 ResponseDto 생성
                Map<String, Object> responseData = new HashMap<>();
                responseData.put("error", "The refresh token does not exist.");

                ResponseDto<Map<String, Object>> responseDto = new ResponseDto<>(
                        "Bad Request: The refresh token does not exist",
                        responseData
                );

                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseDto);
            }

            // expired check
            try {
                tokenProvider.isExpired(refresh);
            } catch (ExpiredJwtException e) {
                // 응답 메시지와 데이터를 포함한 ResponseDto 생성
                Map<String, Object> responseData = new HashMap<>();
                responseData.put("error", "refresh token is expired.");

                ResponseDto<Map<String, Object>> responseDto = new ResponseDto<>(
                        "Bad Request: The refresh token is expired",
                        responseData
                );

                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseDto);
            }

            // 토큰이 refresh인지 확인
            String category = tokenProvider.getCategory(refresh);
            if (!category.equals("refresh")) {
                // 응답 메시지와 데이터를 포함한 ResponseDto 생성
                Map<String, Object> responseData = new HashMap<>();
                responseData.put("error", "invalid token category");

                ResponseDto<Map<String, Object>> responseDto = new ResponseDto<>(
                        "Bad Request: Token category is not 'refresh'",
                        responseData
                );

                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseDto);
            }

            // BlackList에 Access token이 저장되어 있는지 확인하고
            String access = request.getHeader("access");
//            boolean isBlacked = tokenBlacklistService.isContainToken("BL:AT:" + access);
//            if (isBlacked) {
//                // 응답 메시지와 데이터를 포함한 ResponseDto 생성
//                Map<String, Object> responseData = new HashMap<>();
//                responseData.put("error", "invalid token");
//
//                ResponseDto<Map<String, Object>> responseDto = new ResponseDto<>(
//                        "Bad Request: Token is not invalid",
//                        responseData
//                );
//
//                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseDto);
//            }

            // Redis에 Refresh Token이 저장되어 있는지 확인
            boolean isExist = tokenListService.isContainToken("RT:RT:" + userEmail);
            log.info("회원 탈퇴 요청, isExist = " + isExist);
            if(!isExist){
                // 응답 메시지와 데이터를 포함한 ResponseDto 생성
                Map<String, Object> responseData = new HashMap<>();
                responseData.put("error", "refresh token is not available.");

                ResponseDto<Map<String, Object>> responseDto = new ResponseDto<>(
                        "Bad Request: The token does not exist in database",
                        responseData
                );

                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseDto);
            }

            tokenListService.removeToken("RT:RT:" + userEmail);
//            tokenBlacklistService.addTokenToList("BL:AT:" + access);

            /*
            // 기존 코드
            // DB에 저장되어 있는지 확인
            Boolean isExist = refreshRepository.existsByRefresh(refresh);
            if (!isExist) {
                // 응답 메시지와 데이터를 포함한 ResponseDto 생성
                Map<String, Object> responseData = new HashMap<>();
                responseData.put("error", "refresh token is not available.");

                ResponseDto<Map<String, Object>> responseDto = new ResponseDto<>(
                        "Bad Request: The token does not exist in database",
                        responseData
                );

                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseDto);
            }

            // refresh Token을 DB에서 제거
            refreshRepository.deleteByRefresh(refresh);
             */
            // 회원 상태(status) false 전환
            User userEntity = userRepository.findByEmail(userEmail).get();
            userEntity.setStatus(false);
            log.info("in UserServiceImpl, userId = " + userEntity.getUserId());

            // Refresh Token Cookie 값 0
            Cookie cookie = new Cookie("refresh", null);
            cookie.setMaxAge(0);
            cookie.setPath("/");

            // 사용자가 가진 쿠폰 수 조회
            int couponCnt = Optional.ofNullable(haveCouponRepository.findByUser(userEntity))
                    .map(coupons -> coupons.stream()
                            .mapToInt(HaveCoupon::getEa)
                            .sum())
                    .orElse(0);

            // JSON 응답 생성
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("email", userEmail);
            responseData.put("coupon", couponCnt);
            responseData.put("status", false);
            responseData.put("deletedAt", LocalDateTime.now());

            ResponseDto<Map<String, Object>> responseDto = new ResponseDto<>(
                    "Withdraw user success.",
                    responseData);

            return ResponseEntity.ok(responseDto);

        } catch (Exception e) {
            log.error("Unexpected error during authentication", e);

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("error", "Unexpected error during authentication: " + e.getMessage());

            ResponseDto<Map<String, Object>> responseDto = new ResponseDto<>(
                    "Bad Request: Unexpected error during authentication",
                    responseData
            );
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(responseDto);
        }
        // @Transactional 어노테이션을 사용하여 JPA가 트랜잭션 내에서 자동으로 변경 사항을 flush하여 DB에 반영함
    }

    @Override
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> getUserByUserId(Long userId){
        return userRepository.findByUserId(userId);
    }

    @Override
    public ResponseEntity<ResponseDto<Map<String, Object>>> checkLoginStatus(HttpServletRequest request, Authentication authentication){
        String access = request.getHeader("access");
        String userEmail = tokenProvider.getUserEmail(access);

        if (access == null || access.isEmpty()) {
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("message", "Access token is missing");

            ResponseDto<Map<String, Object>> responseDto = new ResponseDto<>(
                    "Access token does not exist.",
                    responseData
            );
            return ResponseEntity.status(401).body(responseDto);
        }

        // BlackList와 Redis Token List 확인
//        boolean isBlacked = tokenBlacklistService.isContainToken("BL:AT:" + access);
        boolean hasExistingToken = tokenListService.isContainToken("RT:AT:" + userEmail);

        // BlackList에 추가되어 있으면
//        if (isBlacked){
//            Map<String, Object> responseData = new HashMap<>();
//            responseData.put("message", "Already logged out. Need to logged in.");
//
//            ResponseDto<Map<String, Object>> responseDto = new ResponseDto<>(
//                    "Already logged out. Need to logged in.",
//                    responseData
//            );
//            return ResponseEntity.status(401).body(responseDto);
//        }

        // Redis에 access token이 없으면
        if (!hasExistingToken) {
            Map<String, Object> responseData = new HashMap<>();
            if (tokenListService.isContainToken("RT:RT:" + userEmail)) {
                responseData.put("message", "need to reissue token.");
                ResponseDto<Map<String, Object>> responseDto = new ResponseDto<>(
                        "please reissue token.",
                        responseData
                );
                return ResponseEntity.status(401).body(responseDto);
            } else {
                responseData.put("message", "please sign in.");
                ResponseDto<Map<String, Object>> responseDto = new ResponseDto<>(
                        "please sign in.",
                        responseData
                );
                return ResponseEntity.status(401).body(responseDto);
            }
        }

        try {
            // 이메일로 사용자 조회
            Optional<User> userOptional = getUserByEmail(userEmail);
            if (userOptional.isEmpty()) {
                Map<String, Object> responseData = new HashMap<>();
                responseData.put("message", "User not found");

                ResponseDto<Map<String, Object>> responseDto = new ResponseDto<>(
                        "User not found",
                        responseData
                );
                return ResponseEntity.status(401).body(responseDto);
            }

            // User 객체 가져오기
            User user = userOptional.get();
            Long userId = user.getUserId();

            // JSON 응답 반환
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("message", "User is authenticated");
            responseData.put("data", Map.of(
                    "userId", userId,
                    "email", userEmail,
                    "access", access // JSON 응답에 accessToken 포함
            ));

            ResponseDto<Map<String, Object>> responseDto = new ResponseDto<>(
                    "User is authenticated",
                    responseData
            );

            return ResponseEntity.ok().body(responseDto);
        } catch (Exception e) {
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("message", "Invalid or expired token");

            ResponseDto<Map<String, Object>> responseDto = new ResponseDto<>(
                    "Invalid or expired token",
                    responseData
            );

            return ResponseEntity.status(401).body(responseDto);
        }
    }

}
