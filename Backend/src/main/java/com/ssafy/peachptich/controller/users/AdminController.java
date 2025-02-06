package com.ssafy.peachptich.controller.users;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@ResponseBody
public class AdminController {

    @GetMapping("/api/admin")
    public String adminProcess(){
        return "admin Controller";
    }
}
