package com.ssafy.peachptich.dto.response;

import lombok.*;

@Getter
@Setter
@RequiredArgsConstructor(staticName = "of")
@AllArgsConstructor
@Builder
public class ResponseDto<T> {
    private final String message;
    private final T data;

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
