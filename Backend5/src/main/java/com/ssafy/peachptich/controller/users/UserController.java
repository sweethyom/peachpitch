package com.ssafy.peachptich.controller.users;

import com.ssafy.peachptich.dto.request.JoinRequest;
import com.ssafy.peachptich.dto.response.ResponseDto;
import com.ssafy.peachptich.entity.User;
import com.ssafy.peachptich.service.UserServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@ResponseBody
@Slf4j
@Tag(name = "UserController", description = "회원 기능 관련 컨트롤러")
public class UserController {
    private final UserServiceImpl userServiceimpl;

    @GetMapping("/api/users/signup")
    @Operation(summary = "회원 가입 페이지 로드", description = "회원 가입 페이지를 로드합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "성공적으로 로드됨")
    })
    public String joinPage(){
        return "Successfully access join page!";
    }

    @PostMapping("/api/users/signup")
    @Operation(summary = "회원 가입", description = "회원 가입을 시도합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "성공적으로 가입됨")
    })
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

    @GetMapping("/api/users/check")
    @Operation(summary = "이메일 중복 확인", description = "이메일 중복 확인을 시도합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "true: 사용가능/false: 중복 이메일 존재"),
    })
    public ResponseEntity<ResponseDto<Map<String, Boolean>>> checkEmail(@RequestParam String email) throws IOException {
        log.info("이메일 중복 확인: " + email);
        return userServiceimpl.checkEmail(email);
    }
    
    @GetMapping("/api/users/delete")
    @Operation(summary = "회원 탈퇴", description = "회원 탈퇴를 시도합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "성공적으로 탈퇴함"),
            @ApiResponse(responseCode = "401", description = "access 토큰 값에 따라, 이미 로그아웃됨"),
            @ApiResponse(responseCode = "400", description = "토큰이 입력되지 않음")
    })
    public ResponseEntity<ResponseDto<Map<String, Object>>> withdrawProcess(HttpServletRequest request, HttpServletResponse response,
                                                                                Authentication authentication){
        return userServiceimpl.withdrawProcess(request, response, authentication);
    }

    @GetMapping("/api/users/check-login")
    @Operation(summary = "로그인 상태 확인", description = "로그인 상태를 확인합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "로그인 상태"),
            @ApiResponse(responseCode = "401", description = "이미 로그아웃된 상태")
    })
    public ResponseEntity<ResponseDto<Map<String, Object>>> checkLoginStatus(HttpServletRequest request,
                                                                             Authentication authentication) {
        return userServiceimpl.checkLoginStatus(request, authentication);
    }

}
