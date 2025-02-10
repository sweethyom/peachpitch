package com.ssafy.peachptich.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * 독립적인 관리와 보안상 정보 분리 관리
 */
@Component("kakaoPayProperties")
@Getter
@Setter
@ConfigurationProperties(prefix = "kakaopay")
public class KakaoPayProperties {
    private String secretKey;
    private String cid;
}
