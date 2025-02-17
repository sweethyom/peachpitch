package com.ssafy.peachptich.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Builder
@Getter
@ToString
//token, 상태를 포함하는 1:1 대화방 내용
public class VideoChatRoomResponse {
    private String token;
    private String status;
    private Long historyId;
    private Long userId;
    private String userName; //나의 이름
    private String matchedUserName; //상대방 이름
    private String matchedUserEmail;
}
