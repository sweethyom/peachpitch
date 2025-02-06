package com.ssafy.peachptich.service;

import com.ssafy.peachptich.dto.CustomUserDetails;
import com.ssafy.peachptich.dto.request.JoinRequest;
import com.ssafy.peachptich.entity.User;
import com.ssafy.peachptich.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    public Optional<User> joinProcess(JoinRequest joinRequest){
        String userEmail = joinRequest.getEmail();
        log.info("joinProcess(), userEmail = " + userEmail);

        String password = joinRequest.getPassword();
        LocalDate birth = joinRequest.getBirth();

        Boolean isExist = userRepository.existsByEmail(userEmail);

        if (isExist) {
            return Optional.empty();
        }

        User data = new User();
        data.setEmail(userEmail);
        data.setPassword(bCryptPasswordEncoder.encode(password));
        data.setBirth(birth);
        data.setRole("ROLE_USER");
        data.setStatus(true);

        User savedUser = userRepository.save(data);

        log.info("successfully data saved!");
        return Optional.of(savedUser);
    }

    @Override
    @Transactional
    public void withdrawProcess(CustomUserDetails userDetails){          // 회원 탈퇴
        User userData = userRepository.findByEmail(userDetails.getUserEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        userData.setStatus(false);
        // @Transactional 어노테이션을 사용하여 JPA가 트랜잭션 내에서 자동으로 변경 사항을 flush하여 DB에 반영함
    }
}
