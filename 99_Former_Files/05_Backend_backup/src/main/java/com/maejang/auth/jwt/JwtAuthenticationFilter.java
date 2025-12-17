package com.maejang.auth.jwt;

import com.maejang.auth.security.CustomUserDetails;
import com.maejang.user.domain.UserRole;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;

    public JwtAuthenticationFilter(JwtTokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String token = extractTokenFromAuthorizationHeader(request);
        if (token == null) {
            // 하위 호환: 쿠키 기반도 허용
            token = extractTokenFromCookie(request.getCookies());
        }
        if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                Claims claims = tokenProvider.parseClaims(token);
                Long userId = tokenProvider.getUserId(claims);
                String email = claims.getSubject();
                UserRole role = tokenProvider.getRole(claims);

                // DB 조회 없이 principal 구성 (토큰 claim 기반)
                CustomUserDetails principal = new CustomUserDetails(userId, email, "", role);

                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
            } catch (Exception ignored) {
                // 토큰이 잘못된 경우: 인증 없이 다음 필터로 (401은 보호 리소스에서 발생)
            }
        }

        filterChain.doFilter(request, response);
    }

    private String extractTokenFromAuthorizationHeader(HttpServletRequest request) {
        String auth = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (auth == null || auth.isBlank()) return null;
        if (!auth.startsWith("Bearer ")) return null;
        String token = auth.substring("Bearer ".length()).trim();
        return token.isBlank() ? null : token;
    }

    private String extractTokenFromCookie(Cookie[] cookies) {
        if (cookies == null) return null;
        for (Cookie c : cookies) {
            if (JwtProperties.COOKIE_NAME.equals(c.getName())) {
                return c.getValue();
            }
        }
        return null;
    }
}


