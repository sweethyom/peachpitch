package com.ssafy.peachptich.dto.oauth;

import lombok.RequiredArgsConstructor;

import java.util.Map;

public class NaverResponse implements OAuthResponse{

    private final Map<String, Object> attribute;

    public NaverResponse(Map<String, Object> attribute) {
        this.attribute = (Map<String, Object>) attribute.get("response");
    }
    @Override
    public String getProvider(){
        return "naver";
    }

    @Override
    public String getProviderId(){
        return attribute.get("id").toString();
    }

    @Override
    public String getEmail(){
        return attribute.get("email").toString();
    }

    @Override
    public String getName(){
        return attribute.get("name").toString();
    }

    @Override
    public String getBirth(){
        return attribute.get("birthyear").toString() + "-" + attribute.get("birthday").toString();
    }

    @Override
    public String getSnsId(){
        return attribute.get("id").toString();
    }
}
