package com.ssafy.peachptich.service;

import com.ssafy.peachptich.dto.response.TrialResponse;

public interface TrialService {
    public TrialResponse checkTrialAccess(String fingerprint);
}
