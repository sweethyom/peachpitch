package com.ssafy.peachptich.service;

import com.ssafy.peachptich.dto.response.RankResponse;
import com.ssafy.peachptich.entity.Keyword;
import com.ssafy.peachptich.entity.User;
import com.ssafy.peachptich.entity.UserKeyword;
import com.ssafy.peachptich.repository.KeywordRepository;
import com.ssafy.peachptich.repository.UserKeywordRepository;
import com.ssafy.peachptich.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class UserKeywordServiceImpl implements UserKeywordService {
    private final UserKeywordRepository userKeywordRepository;
    private final UserRepository userRepository;
    private final KeywordRepository keywordRepository;

    @Transactional
    public void saveOrUpdate(Long userId, Long keywordId) {
        if(userKeywordRepository.existsByUser_UserIdAndKeyword_KeywordId(userId, keywordId)) {
            // 이미 userId와 keywordId로 저장된 데이터가 있으면 count 증가
            userKeywordRepository.incrementCount(userId, keywordId);
        }
        else {
            // 새로운 데이터 저장
            User user = userRepository.findById(userId).orElseThrow(()->new IllegalArgumentException("User not found"));
            Keyword keyword = keywordRepository.findById(keywordId).orElseThrow(()->new IllegalArgumentException("Keyword not found"));
            UserKeyword userKeyword = UserKeyword.builder()
                    .user(user)
                    .keyword(keyword)
                    .count(1)
                    .build();

            userKeywordRepository.save(userKeyword);
        }
    }

    public List<RankResponse.KeywordRankResponseItem> rank() {
        List<Object[]> result = userKeywordRepository.findTop3KeywordsByCount();
        List<RankResponse.KeywordRankResponseItem> items = new ArrayList<>();
        for(Object[] obj : result) {
            String keyword = (String) obj[0];
            Integer count =Integer.parseInt(String.valueOf(obj[1]));
            items.add(RankResponse.KeywordRankResponseItem.builder()
                    .keyword(keyword)
                    .count(count)
                    .build());
        }
        return items;
    }
}
