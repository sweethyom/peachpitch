package com.ssafy.peachptich.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
//keyword, hints, 상태를 포함하는 대화방 내용
public class ChatRoomResponse {
    private Long historyId; // 로그인 하지 않은 유저는 null 반환
    String status; //AI대화는 항상 completed, 1:1대화는 키워드 한명만 고르면 waiting, 둘 다 고르면 completed
    private String keyword;
    private List<HintResponse> hints;
}