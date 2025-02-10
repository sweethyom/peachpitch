package com.ssafy.peachptich.dto.oauth;

import lombok.RequiredArgsConstructor;

import java.util.Map;

@RequiredArgsConstructor
public class GoogleResponse implements OAuthResponse{
    private final Map<String, Object> attribute;

    @Override
    public String getProvider(){
        return "google";
    }

    @Override
    public String getProviderId(){
        return attribute.get("sub").toString();
    }

    @Override
    public String getEmail(){
        return attribute.get("email").toString();
    }

    @Override
    public String getName(){
        return attribute.get("name").toString();
    }

    // 구글은 기본적으로 유저의 생일 정보를 제공하지 않음
    @Override
    public String getBirth(){
        return null;
    }

    @Override
    public String getSnsId(){
        return attribute.get("sub").toString();
    }
}
