package com.ssafy.peachptich.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class JoinRequest {

    private String email;
    private String password;
    private LocalDate birth;
}
