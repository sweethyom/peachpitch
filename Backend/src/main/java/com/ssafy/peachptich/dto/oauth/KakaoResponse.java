package com.ssafy.peachptich.dto.oauth;

import lombok.RequiredArgsConstructor;

import java.util.Map;

public class KakaoResponse implements OAuthResponse{
    private final Map<String, Object> attribute;
    private Map<String, Object> kakaoAccountAttribute;
    private Map<String, Object> profileAttribute;

    public KakaoResponse(Map<String, Object> attribute) {
        this.attribute = attribute;
        this.kakaoAccountAttribute = (Map<String, Object>) attribute.get("kakao_account");
        this.profileAttribute = (Map<String, Object>) attribute.get("profile");
    }

    @Override
    public String getProvider(){
        return "kakao";
    }

    @Override
    public String getProviderId(){
        return attribute.get("id").toString();
    }

    @Override
    public String getEmail(){
        return kakaoAccountAttribute.get("email").toString();
    }

    @Override
    public String getName(){
        return kakaoAccountAttribute.get("nickname").toString();
    }

    // 생일 권한 못 얻음
    @Override
    public String getBirth(){
        return null;
    }
}
