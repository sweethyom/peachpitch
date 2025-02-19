package com.ssafy.peachptich.global.config;

import io.swagger.v3.oas.models.*;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.parameters.RequestBody;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.responses.ApiResponses;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.core.customizers.OperationCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.Map;

@Slf4j
@Configuration
public class SwaggerConfig {
    @Bean
    public OpenAPI customOpenAPI() {
        // 로그인 API 경로 설정
        PathItem loginPathItem = new PathItem()
                .post(new Operation()
                        .tags(List.of("Login"))
                        .summary("로그인 API")
                        .description("이메일과 비밀번호로 로그인합니다.")
                        .requestBody(new RequestBody()  // Parameter 대신 RequestBody 사용
                                .required(true)
                                .description("로그인 정보")
                                .content(new Content()
                                        .addMediaType("application/json",
                                                new MediaType().schema(new Schema<>()
                                                        .$ref("#/components/schemas/LoginRequest")))))
                        .responses(new ApiResponses()
                                .addApiResponse("200", new ApiResponse()
                                        .description("로그인 성공")
                                        .content(new Content()
                                                .addMediaType("application/json"
                                                        , new MediaType().schema(new Schema<>().type("object")
                                                                .addProperty("access", new Schema<>()
                                                                        .type("string")
                                                                        .description("JWT access token"))
                                                                .addProperty("message", new Schema<>()
                                                                        .type("string")
                                                                        .example("Login successful!")))))
                                .extensions(Map.of(
                                        "x-token-response", Map.of(
                                                "access-token-path", "$.access",
                                                "refresh-token-cookie", "refresh"
                                        ))))
                                .addApiResponse("401", new ApiResponse()
                                        .description("인증 실패")))
                        .extensions(Map.of("x-codegen-request-body-name", "loginRequest",
                                "x-swagger-router-controller", "AuthenticationController",
                                "x-auto-login", true)));        // 자동 로그인 처리를 위한 커스텀 확장
        // 스키마 정의
        Schema<?> loginRequestSchema = new Schema<>()
                .type("object")
                .addProperty("email", new Schema<>().type("string"))
                .addProperty("password", new Schema<>().type("string"));

        // Access token security schema
        SecurityScheme accessTokenSchema = new SecurityScheme()
                .type(SecurityScheme.Type.APIKEY)
                .in(SecurityScheme.In.HEADER)
                .name("access")
                .description("JWT access token")
                .extensions(Map.of(
                        "x-auto-auth", true,
                        "x-auth-login-path", "/api/users/login"
                ));

        SecurityScheme refreshTokenSchema = new SecurityScheme()
                .type(SecurityScheme.Type.APIKEY)
                .in(SecurityScheme.In.COOKIE)  // COOKIE로 변경
                .name("refresh")
                .description("JWT refresh token in cookie (HttpOnly)")
                // 쿠키 관련 추가 설명
                .extensions(Map.of(
                        "x-cookie-config", Map.of(
                                "secure", true,
                                "sameSite", "None"
                        ),
                        "x-auto-auth", true,
                        "x-auth-login-path", "/api/users/login"
                ));


        // Global security requirement
        SecurityRequirement securityRequirement = new SecurityRequirement()
                .addList("access-key");

        return new OpenAPI()
                .paths(new Paths().addPathItem("/api/users/login", loginPathItem))
                .components(new Components()
                        .addSchemas("LoginRequest", loginRequestSchema)
                        .addSecuritySchemes("access-key", accessTokenSchema)
                        .addSecuritySchemes("refresh-cookie", refreshTokenSchema))
                .info(new Info()
                        .title("PeachPitch API")
                        .description("PeachPitch 웹 애플리케이션의 데이터 CRUD를 위한 API입니다.")
                        .version("1.0"))
                .addSecurityItem(securityRequirement);
    }

    @Bean
    public OperationCustomizer customizeOperation() {
        return (operation, handlerMethod) -> {
            // Refresh token이 필요한 특정 엔드포인트에만 refresh token 요구사항 추가
            if (handlerMethod.getMethod().getName().contains("refresh")) {
                operation.addSecurityItem(
                        new SecurityRequirement()
                                .addList("refresh-cookie")
                );
            } else {
                // 기본적으로는 access token만 요구
                operation.addSecurityItem(
                        new SecurityRequirement()
                                .addList("access-key")
                );
            }
            return operation;
        };
    }
}