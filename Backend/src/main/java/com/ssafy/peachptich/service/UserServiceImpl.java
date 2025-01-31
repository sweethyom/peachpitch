package com.ssafy.peachptich.service;

import com.ssafy.peachptich.dto.request.JoinDTO;
import com.ssafy.peachptich.entity.User;
import com.ssafy.peachptich.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    public void joinProcess(JoinDTO joinDTO){
        String userEmail = joinDTO.getEmail();
        String password = joinDTO.getPassword();
        LocalDate birth = joinDTO.getBirth();

        Boolean isExist = userRepository.existsByEmail(userEmail);

        if (isExist) {
            return;
        }

        User data = new User();
        data.setEmail(userEmail);
        data.setPassword(bCryptPasswordEncoder.encode(password));
        data.setBirth(birth);
        data.setRole("ROLE_USER");

        userRepository.save(data);
        System.out.println("successfully data saved!");

    }
}
