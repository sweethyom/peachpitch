package com.ssafy.peachptich.dto;

import com.ssafy.peachptich.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Map;

@RequiredArgsConstructor
public class CustomUserDetails implements UserDetails, OAuth2User {

    private final User userEntity;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities(){
        Collection<GrantedAuthority> collection = new ArrayList<>();
        collection.add(new GrantedAuthority() {
            @Override
            public String getAuthority() {
                return userEntity.getRole();
            }
        });

        return collection;
    }

    public String getUserEmail(){
        return userEntity.getEmail();
    }

    public Long getUserId() {
        return userEntity.getUserId();
    }

    // UserDetails 인터페이스를 상속받아야 해서 무조건 Overriding 해야 함
    @Override
    public String getUsername(){
        return userEntity.getEmail();
    }

    @Override
    public String getPassword(){
        return userEntity.getPassword();
    }

    public String getBirth(){
        return userEntity.getBirth().toString();
    }

    @Override
    public boolean isAccountNonExpired(){
        //TODO
        // 일단 true 해둔 것!
        return true;
    }

    @Override
    public boolean isAccountNonLocked(){
        return true;
    }

    //TODO
    // 이건 무슨 메소드인지 명확히 확인하기
    @Override
    public boolean isCredentialsNonExpired(){
        return true;
    }

    //TODO
    // NonExpired 메소드랑 어떤 차이?
    @Override
    public boolean isEnabled(){
        return true;
    }

    @Override
    public Map<String, Object> getAttributes(){
        return null;
    }

    //TODO
    // UserDTO에 필드를 email로 변경해야 하나?
    @Override
    public String getName(){
        return userEntity.getEmail();
    }

}
