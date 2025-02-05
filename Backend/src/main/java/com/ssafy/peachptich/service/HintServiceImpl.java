package com.ssafy.peachptich.service;

import com.ssafy.peachptich.dto.response.HintResponseDto;
import com.ssafy.peachptich.repository.HintRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HintServiceImpl implements HintService {
    private final HintRepository hintRepository;

    @Override
    public List<HintResponseDto> getHints(Long keywordId) {
        return hintRepository.findByKeywordId(keywordId);
    }
}
