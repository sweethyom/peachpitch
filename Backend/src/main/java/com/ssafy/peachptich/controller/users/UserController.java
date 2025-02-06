//package com.ssafy.peachptich.controller.users;
//
//import com.ssafy.peachptich.dto.request.JoinDTO;
//import com.ssafy.peachptich.service.UserServiceImpl;
//import lombok.RequiredArgsConstructor;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.ResponseBody;
//import org.springframework.web.bind.annotation.RestController;
//
//@RestController
//@RequiredArgsConstructor
//@ResponseBody
//public class UserController {
//    private final UserServiceImpl userServiceimpl;
//
//    @PostMapping("/join")
//    public String joinProcess(JoinDTO joinDTO){
//        System.out.println("UserController 입성");
//        userServiceimpl.joinProcess(joinDTO);
//
//        return "join success";
//    }
//
//}
