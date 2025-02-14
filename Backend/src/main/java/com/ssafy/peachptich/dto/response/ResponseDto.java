package com.ssafy.peachptich.dto.response;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class ResponseDto<T> {
    private final String message;
    private final T data;
}
