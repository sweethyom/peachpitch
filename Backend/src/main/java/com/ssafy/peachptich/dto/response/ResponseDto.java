package com.ssafy.peachptich.dto.response;

import lombok.*;

@Getter
@Setter
@Builder
public class ResponseDto<T> {
    private final String message;
    private final T data;

    @Builder
    public ResponseDto(String message, T data) {
        this.message = message;
        this.data = data;
    }

    // 데이터가 없는 응답을 위한 생성자
    public ResponseDto(String message) {
        this.message = message;
        this.data = null;
    }

    // Custom Exception
    public static class DuplicateEmailException extends RuntimeException {
        public DuplicateEmailException(String message) {
            super(message);
        }
    }
}
