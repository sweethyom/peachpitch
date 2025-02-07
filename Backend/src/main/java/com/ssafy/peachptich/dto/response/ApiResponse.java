package com.ssafy.peachptich.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

// DTO for APIResponse
@Getter
@AllArgsConstructor
@Builder
public class ApiResponse<T> {
    private String message;
    private T data;

    // 데이터가 없는 응답을 위한 생성자
    public ApiResponse(String message) {
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
