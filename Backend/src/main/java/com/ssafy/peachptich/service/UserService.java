package com.ssafy.peachptich.service;

import com.ssafy.peachptich.dto.CustomUserDetails;
import com.ssafy.peachptich.dto.request.JoinRequest;
import com.ssafy.peachptich.entity.User;

import java.util.Optional;

public interface UserService {
    public Optional<User> joinProcess(JoinRequest joinRequest);
    public void withdrawProcess(CustomUserDetails userDetails);
}
