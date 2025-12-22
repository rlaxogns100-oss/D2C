package com.maejang.global.config;

import com.maejang.auth.jwt.JwtAuthenticationFilter;
import com.maejang.auth.jwt.JwtTokenProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtTokenProvider jwtTokenProvider) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                // 🔥 CORS 설정 추가 (WebConfig 만으로는 부족함)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Swagger 허용
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/swagger-ui.html"
                        ).permitAll()

                        // Auth 허용
                        .requestMatchers(
                                "/api/v1/users/login",
                                "/api/v1/users/logout",
                                "/api/v1/users/sing_in",
                                "/api/v1/users/sign_in",
                                "/api/v1/users/email/duplicate"
                        ).permitAll()

                        // JWT 쿠키 로그인/로그아웃 허용
                        .requestMatchers(
                                "/api/v1/auth/login",
                                "/api/v1/auth/logout"
                        ).permitAll()

                        // 이미지 업로드 (인증된 사용자만)
                        .requestMatchers("/api/images/**").authenticated()

                        // 가게 정보 조회 (고객도 볼 수 있어야 함)
                        .requestMatchers("/api/v1/store/{storeId}").permitAll()
                        .requestMatchers("/api/v1/stores/by-subdomain").permitAll()
                        .requestMatchers("/api/v1/stores/check-subdomain").permitAll()
                        .requestMatchers("/api/v1/menu/read/**").permitAll()

                        // Role 기반 접근 제어 (JWT 적용 전에는 ownerId/userId를 요청으로 받아도 결국 서버에서 role 체크 필요)
                        .requestMatchers("/api/v1/store/**").hasRole("OWNER")
                        .requestMatchers("/api/v1/menu/create", "/api/v1/menu/delete/**", "/api/v1/menu/update/**").hasRole("OWNER")
                        .requestMatchers("/api/v1/address/**", "/api/v1/cart/**").hasRole("CUSTOMER")
                        // 주문: 고객/사장 기능이 섞여있어서 endpoint 별로 분리
                        .requestMatchers("/api/v1/order/create", "/api/v1/order/read", "/api/v1/order/history", "/api/v1/order/delete").hasRole("CUSTOMER")
                        .requestMatchers("/api/v1/order/check", "/api/v1/order/ok", "/api/v1/order/cancel", "/api/v1/order/complete", "/api/v1/order/deliver").hasRole("OWNER")

                        .anyRequest().authenticated()
                );

        http.addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // 🔥 CORS 설정 빈 등록
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // 모든 출처 허용 (보안상 도메인을 특정하는 것이 좋지만, 지금은 연결이 우선)
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
