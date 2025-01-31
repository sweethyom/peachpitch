package com.ssafy.peachptich.controller;

import org.springframework.web.bind.annotation.GetMapping;

public class MainController {
    @GetMapping("/")
    public String mainP(){
        return "ok";
    }
}
