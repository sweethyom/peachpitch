package com.ssafy.peachptich.controller;

import com.ssafy.peachptich.dto.request.TrialRequest;
import com.ssafy.peachptich.dto.response.TrialResponse;
import com.ssafy.peachptich.service.TrialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/trial")
public class TrialController {

    private final TrialService trialService;

    @Autowired
    public TrialController(TrialService trialService) {
        this.trialService = trialService;
    }

    @GetMapping("/health-check")
    public String healthCheck(){
        return "OK";
    }

    @PostMapping("/check")
    public ResponseEntity<TrialResponse> checkTrial(@RequestBody TrialRequest request) {
        return ResponseEntity.ok(trialService.checkTrialAccess(request.getFingerprint()));
    }
}