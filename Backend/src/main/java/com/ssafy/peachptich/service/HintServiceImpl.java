package com.ssafy.peachptich.service;

import com.ssafy.peachptich.dto.response.HintResponse;
import com.ssafy.peachptich.repository.HintRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HintServiceImpl implements HintService {
    private final HintRepository hintRepository;

    @Override
    public List<HintResponse> getHints(Long keywordId) {
        return hintRepository.findByKeywordId(keywordId);
    }
}
