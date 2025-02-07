package com.ssafy.peachptich.controller.users;

import com.ssafy.peachptich.dto.request.JoinRequest;
import com.ssafy.peachptich.dto.response.ResponseDto;
import com.ssafy.peachptich.service.UserServiceImpl;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@ResponseBody
@Slf4j
public class UserController {
    private final UserServiceImpl userServiceimpl;

    @GetMapping("/api/users/signup")
    public String joinPage(){
        return "Successfully access join page!";
    }

    @PostMapping("/api/users/signup")
    public ResponseEntity<ResponseDto<Map<String, Long>>> joinProcess(@RequestBody JoinRequest joinRequest){
        log.info("회원 가입 시도");
        return userServiceimpl.joinProcess(joinRequest)
                .map(user -> {
                    // 응답 데이터 Map 생성
                    Map<String, Long> responseData = new HashMap<>();
                    responseData.put("userId", user.getUserId());

                    // ResponseDto 생성 후 ResponseEntity로 래핑하여 반환
                    return ResponseEntity.ok(new ResponseDto<Map<String, Long>>(
                            "User register Success!", responseData));
                })
                .orElseThrow(() -> new ResponseDto.DuplicateEmailException("Email already exists"));
    }

    //TODO
    // 이메일 중복 확인
    // @GetMapping("/api/users/check")
    // PathVariables(String email)


    //TODO
    // 회원 탈퇴 기능 구현
    @GetMapping("/api/users/delete")
//    public ResponseEntity<String> withdrawProcess(@AuthenticationPrincipal CustomUserDetails userDetails){
        public ResponseEntity<ResponseDto<Map<String, Object>>> withdrawProcess(HttpServletRequest request, HttpServletResponse response,
                                                                                Authentication authentication){
        return userServiceimpl.withdrawProcess(request, response, authentication);
    }
}
