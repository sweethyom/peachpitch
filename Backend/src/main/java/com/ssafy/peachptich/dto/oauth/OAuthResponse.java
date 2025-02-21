package com.ssafy.peachptich.dto.oauth;

public interface OAuthResponse {
    // 제공자 (e.g. naver, google, ...)
    String getProvider();

    // 제공자에서 발급해주는 아이디(번호)
    String getProviderId();

    // 이메일
    String getEmail();

    // 사용자 실명 (설정한 이름)
    String getName();

    // 사용자 생일
    String getBirth();
}
