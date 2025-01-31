package com.ssafy.peachptich.dto;

import com.ssafy.peachptich.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;

@RequiredArgsConstructor
public class CustomUserDetails implements UserDetails {

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

    // UserDetails 인터페이스를 상속받아야 해서 무조건 Overriding 해야 함
    @Override
    public String getUsername(){
        return "ok";
    }

    @Override
    public String getPassword(){
        return userEntity.getPassword();
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



}
