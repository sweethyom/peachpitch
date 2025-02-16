package com.ssafy.peachptich.service;

import com.ssafy.peachptich.entity.User;
import com.ssafy.peachptich.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class CustomUserDetailsServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CustomUserDetailsService customUserDetailsService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void loadUserByUsername_UserExists_ReturnsCustomUserDetails() {
        // Given
        String email = "test@example.com";
        User user = User.builder()
                .email(email)
                .password("encodedPassword")
                .build();

        // When
        org.mockito.Mockito.when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        // Then
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);

        assertNotNull(userDetails);
        assertEquals(email, userDetails.getUsername()); // 이 부분이 실패했다면 getUsername() 구현 확인
        org.mockito.Mockito.verify(userRepository).findByEmail(email);
    }

    @Test
    void loadUserByUsername_UserNotFound_ThrowsUsernameNotFoundException() {
        // Given
        String email = "nonexistent@example.com";

        // When
        org.mockito.Mockito.doReturn(Optional.empty()).when(userRepository).findByEmail(email);

        // Then
        assertThrows(UsernameNotFoundException.class, () -> {
            customUserDetailsService.loadUserByUsername(email);
        });

        org.mockito.Mockito.verify(userRepository).findByEmail(email);
    }

}