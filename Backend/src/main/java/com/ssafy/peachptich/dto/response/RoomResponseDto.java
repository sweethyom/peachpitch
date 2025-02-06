package com.ssafy.peachptich.dto.response;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class RoomResponseDto {
    private String token;
    private Long historyId;
}
