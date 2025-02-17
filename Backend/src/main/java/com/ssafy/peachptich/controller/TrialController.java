package com.ssafy.peachptich.controller;

import com.ssafy.peachptich.dto.request.TrialRequest;
import com.ssafy.peachptich.dto.response.TrialResponse;
import com.ssafy.peachptich.service.TrialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/trial")
@Tag(name = "TrialController", description = "무료 이용 관련 컨트롤러")
public class TrialController {

    private final TrialService trialService;

    @Autowired
    public TrialController(TrialService trialService) {
        this.trialService = trialService;
    }

    @PostMapping("/check")
    @Operation(summary = "무료 이용 체크", description = "사용자의 무료 이용 가능 여부를 확인합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "성공적으로 확인됨")
    })
    public ResponseEntity<TrialResponse> checkTrial(@RequestBody TrialRequest request) {
        return ResponseEntity.ok(trialService.checkTrialAccess(request.getFingerprint()));
    }
}