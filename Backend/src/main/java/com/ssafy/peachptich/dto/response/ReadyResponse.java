package com.ssafy.peachptich.dto.response;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class ReadyResponse {
    private String tid;                     // 결제 고유번호
    private String next_redirect_pc_url;    // 카카오톡으로 결제 요청 메시지(TMS)를 보내기 위한 사용자 정보 입력화면 Redirect URL (카카오 측 제공)
//    private String next_redirect_mobile_url; // 요청 클라이언트가 모바일 웹일 경우
}
