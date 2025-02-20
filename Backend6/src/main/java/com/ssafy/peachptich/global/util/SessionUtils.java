package com.ssafy.peachptich.global.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Objects;

@Slf4j
public class SessionUtils {
    public static void addAttribute(String name, Object value) {
        RequestAttributes attributes = RequestContextHolder.getRequestAttributes();
        log.info("세션 저장 시도: {} = {}", name, value);
        log.info("현재 세션 ID: {}", ((ServletRequestAttributes) attributes).getRequest().getSession().getId());
        attributes.setAttribute(name, value, RequestAttributes.SCOPE_SESSION);
    }

    public static String getStringAttributeValue(String name) {
        RequestAttributes attributes = RequestContextHolder.getRequestAttributes();
        log.info("세션 조회 시도: {}", name);
        log.info("현재 세션 ID: {}", ((ServletRequestAttributes) attributes).getRequest().getSession().getId());
        Object value = attributes.getAttribute(name, RequestAttributes.SCOPE_SESSION);
        return value != null ? String.valueOf(value) : null;
    }
    public static Object getAttribute(String name) {
        log.info("세션 속성 조회: {}", name);
        Object value = Objects.requireNonNull(RequestContextHolder.getRequestAttributes())
                .getAttribute(name, RequestAttributes.SCOPE_SESSION);
        log.info("세션 속성 값: {}", value);
        return value;
    }

    // 세션의 모든 속성 조회
    public static void printSessionAttributes() {
        RequestAttributes attributes = RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            // 세션에 저장된 모든 속성 이름을 가져옴
            String[] attributeNames = attributes.getAttributeNames(RequestAttributes.SCOPE_SESSION);
            log.info("세션 속성 개수: {}", attributeNames.length);

            // 각 속성의 이름과 값을 로그로 출력
            for (String attributeName : attributeNames) {
                Object value = attributes.getAttribute(attributeName, RequestAttributes.SCOPE_SESSION);
                log.info("세션 속성 - {}: {}", attributeName, value);
            }
        } else {
            log.info("세션이 존재하지 않습니다.");
        }
    }

    // 세션의 크기 반환
    public static int getSessionSize() {
        RequestAttributes attributes = RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            return attributes.getAttributeNames(RequestAttributes.SCOPE_SESSION).length;
        }
        return 0;
    }
}
