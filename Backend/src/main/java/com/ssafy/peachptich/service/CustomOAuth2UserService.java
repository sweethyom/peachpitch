package com.ssafy.peachptich.service;

import com.ssafy.peachptich.dto.CustomUserDetails;
import com.ssafy.peachptich.dto.oauth.*;
import com.ssafy.peachptich.entity.HaveCoupon;
import com.ssafy.peachptich.entity.Item;
import com.ssafy.peachptich.entity.User;
import com.ssafy.peachptich.repository.HaveCouponRepository;
import com.ssafy.peachptich.repository.ItemRepository;
import com.ssafy.peachptich.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    private final UserRepository userRepository;
    private final HaveCouponRepository haveCouponRepository;
    private final ItemRepository itemRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException{
        OAuth2User oAuth2User = super.loadUser(userRequest);
        log.info("in CustomOAuth2UserService, oAuth2User = " + oAuth2User);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        OAuthResponse oAuthResponse = null;

        if(registrationId.equals("naver")) {
            oAuthResponse = new NaverResponse(oAuth2User.getAttributes());
        } else if (registrationId.equals("google")) {
            oAuthResponse = new GoogleResponse(oAuth2User.getAttributes());
        } else{
            return null;
        }

        // 리소스 서버에서 발급 받은 정보로 사용자를 특정할 아이디 값을 생성
        String email = oAuthResponse.getEmail();
        String birth = oAuthResponse.getBirth();
        String snsId = oAuthResponse.getSnsId();
        int dot = email.split("@")[1].indexOf('.');
        String snsName = email.split("@")[1].substring(0, dot);
        if (snsName.equals("gmail")){
            snsName = "google";
        }

        if (birth == null){
            log.info("in CustomOAuth2UserService, email = " + email);
            log.info("in CustomOAuth2UserService, snsId = " + snsId);
            log.info("in CustomOAuth2UserService, snsName = " + snsName);
        } else {
            log.info("in CustomOAuth2UserService, email = " + email);
            log.info("in CustomOAuth2UserService, birth = " + birth);
            log.info("in CustomOAuth2UserService, snsId = " + snsId);
            log.info("in CustomOAuth2UserService, snsName = " + snsName);
        }

        User existsData = userRepository.findByEmail(email).orElse(null);

        // 기존에 등록된 회원이 없다면,
        if (existsData == null){
            User user = new User();
            user.setEmail(email);
            user.setPassword(null);
            user.setRole("ROLE_USER");
            user.setStatus(true);
            user.setSnsType(snsName);
            user.setSnsId(snsId);

            User savedUser = userRepository.save(user);
            log.info("in CustomOAuth2UserService, savedUser = " + savedUser.getUserId());

            List< Item > items = itemRepository.findAll();

            for (Item item : items) {
                HaveCoupon haveCoupon = HaveCoupon.builder()
                    .user(savedUser)
                    .item(item)
                    .ea(0)
                    .build();
                haveCouponRepository.save(haveCoupon);
            }

            return new CustomUserDetails(user);
        }

        // 탈퇴한 회원이면
        if (!existsData.getStatus()){
            log.error("탈퇴한 회원입니다.");
            throw new WithdrawnMemberException("A member who has withdrawn.");
        }

        return new CustomUserDetails(existsData);
    }

    public static class WithdrawnMemberException extends OAuth2AuthenticationException {
        public WithdrawnMemberException(String message) {
            super(new OAuth2Error("withdrawn_member"), message);
        }
    }


}
