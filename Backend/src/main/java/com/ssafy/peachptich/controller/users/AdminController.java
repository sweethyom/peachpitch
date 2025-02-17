
package com.ssafy.peachptich.controller.users;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@ResponseBody
@Tag(name = "AdminController", description = "관리자 관련 컨트롤러")
public class AdminController {

    @GetMapping("/api/admin")
    @Operation(summary = "관리자 페이지 로드", description = "관리자 페이지를 로드합니다.", security = @SecurityRequirement(name = "role"))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "성공적으로 로드함")
    })
    public String adminProcess(){
        return "admin Controller";
    }
}

