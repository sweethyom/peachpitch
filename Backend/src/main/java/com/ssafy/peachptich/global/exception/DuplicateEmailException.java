package com.ssafy.peachptich.global.exception;

// @ResponseStatus(HttpStatus.CONFLICT) // 예외 클래스에 추가
public class DuplicateEmailException extends RuntimeException {
    public DuplicateEmailException(String message) {
        super(message);
    }
}
