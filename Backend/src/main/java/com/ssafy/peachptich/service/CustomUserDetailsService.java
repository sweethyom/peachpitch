//package com.ssafy.peachptich.service;
//
//import com.ssafy.peachptich.dto.CustomUserDetails;
//import com.ssafy.peachptich.entity.User;
//import com.ssafy.peachptich.repository.UserRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.security.core.userdetails.UserDetails;
//import org.springframework.security.core.userdetails.UserDetailsService;
//import org.springframework.security.core.userdetails.UsernameNotFoundException;
//import org.springframework.stereotype.Service;
//
//@Service
//@RequiredArgsConstructor
//public class CustomUserDetailsService implements UserDetailsService {
//
//    private final UserRepository userRepository;
//
//    @Override
//    public UserDetails loadUserByUsername(String userEmail) throws UsernameNotFoundException {
//        // DB에서 조회
//        User userData = userRepository.findByEmail(userEmail);
//
//        if (userData != null) {
//            return new CustomUserDetails(userData);
//        }
//
//        return null;
//    }
//}
