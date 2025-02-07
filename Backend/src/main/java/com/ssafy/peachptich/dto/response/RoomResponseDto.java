package com.ssafy.peachptich.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Builder
@Getter
@ToString
public class RoomResponseDto {
    private String token;
    private String status;
    private Long historyId;
    private String userName; //나의 이름
    private String matchedUserName; //상대방 이름
}
