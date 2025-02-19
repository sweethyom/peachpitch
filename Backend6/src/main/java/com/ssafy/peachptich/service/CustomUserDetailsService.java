package com.ssafy.peachptich.service;

import com.ssafy.peachptich.dto.CustomUserDetails;
import com.ssafy.peachptich.entity.User;
import com.ssafy.peachptich.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String userEmail) throws UsernameNotFoundException {
        // DB에서 조회
        User userData = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + userEmail));

        System.out.println("CustomUserDetailsService에서 userData = " + userData);
        return new CustomUserDetails(userData);
    }
}
