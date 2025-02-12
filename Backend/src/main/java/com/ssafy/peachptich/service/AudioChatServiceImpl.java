package com.ssafy.peachptich.service;

import com.ssafy.peachptich.dto.CustomUserDetails;
import com.ssafy.peachptich.dto.request.AudioChatRequest;
import com.ssafy.peachptich.dto.request.TrialRequest;
import com.ssafy.peachptich.dto.response.ChatRoomResponse;
import com.ssafy.peachptich.dto.response.HintResponse;
import com.ssafy.peachptich.entity.RandomName;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AudioChatServiceImpl implements AudioChatService {
    private final TrialService trialService;
    private final KeywordService keywordService;
    private final HintService hintService;
    private final RandomName randomName;
    private final ChatHistoryService chatHistoryService;
    private final UserKeywordService userKeywordService;
    private final CouponService couponService;

    @Override
    public boolean isAvailable(TrialRequest trialRequest, CustomUserDetails userDetails) {
        if (userDetails == null) {
            //비로그인 유저는 finger print 확인
//            return trialService.checkTrialAccess(trialRequest.getFingerprint()).isCanAccess();
            return true;
        } else {
            //로그인 유저는 쿠폰 확인
            Long userId = userDetails.getUserId();
//            System.out.println("쿠폰 갯수= " + couponService.getAvailableCoupons(userId));
//            return couponService.getAvailableCoupons(userId) > 0;
            return true;
        }
    }

    @Override
    public ChatRoomResponse getChatRoom(AudioChatRequest audioChatRequest, CustomUserDetails userDetails) {
        Long keywordId = audioChatRequest.getKeywordId();
        String keyword = keywordService.getKeyword(keywordId);
        List<HintResponse> hints = hintService.getHints(keywordId);

        ChatRoomResponse chatRoomResponse = ChatRoomResponse.builder()
                .hints(hints)
                .keyword(keyword)
                .build();

        if (userDetails != null) {
            Long userId = userDetails.getUserId();
            String name = randomName.getRandomName();
            Long historyId = chatHistoryService.addAudioChatHistory(userId, keywordId, name);
            userKeywordService.saveOrUpdate(userId, keywordId);
            //couponService.useCoupon(userId);
            System.out.println("쿠폰 사용");
            chatRoomResponse = ChatRoomResponse.builder()
                    .hints(hints)
                    .keyword(keyword)
                    .historyId(historyId)
                    .build();
        }
        return chatRoomResponse;
    }
}
