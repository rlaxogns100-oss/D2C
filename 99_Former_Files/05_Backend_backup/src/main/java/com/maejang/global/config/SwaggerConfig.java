package com.maejang.global.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    private static final String BEARER_AUTH = "bearerAuth";

    @Bean
    public OpenAPI openAPI() {
        Info info = new Info()
                .version("1.0")
                .title("Maejang API")
                .description("<h2>배달 사이트 프로젝트</h2> API 명세서");

        // Swagger UI에서 "Authorize" 버튼/자물쇠 표시를 위해 Bearer JWT 보안 스키마 등록
        return new OpenAPI()
                .info(info)
                .components(new Components()
                        .addSecuritySchemes(BEARER_AUTH, new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")))
                // 기본적으로는 인증이 걸려있다고 표시 (permitAll 엔드포인트는 실제로는 열려있음)
                .addSecurityItem(new SecurityRequirement().addList(BEARER_AUTH));

    }

}
