package com.ssafy.peachptich.global.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.context.SecurityContext;

import java.util.Arrays;

@Slf4j
@Configuration
public class SwaggerConfig {
    @Bean
    public OpenAPI customOpenAPI() {
        SecurityScheme securityScheme = new SecurityScheme()
                .type(SecurityScheme.Type.APIKEY)
                .in(SecurityScheme.In.HEADER)
                .name("access")
                .description("JWT token");

        return new OpenAPI()
                .components(new Components().addSecuritySchemes("access-key", securityScheme))
                .info(new Info()
                        .title("PeachPitch API")
                        .description("PeachPitch 웹 애플리케이션의 데이터 CRUD를 위한 API입니다.")
                        .version("1.0"))
                .addSecurityItem(new SecurityRequirement().addList("access-key"));
    }
}