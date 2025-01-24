package com.ssafy.peachptich.dto.response;

import lombok.*;

@Getter
@Setter
@RequiredArgsConstructor(staticName = "of")
public class ResponseDto<T> {
    private final String message;
    private final T data;
}
