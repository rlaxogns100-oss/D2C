package com.maejang.auth.jwt;

import com.maejang.user.domain.UserRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtTokenProvider {

    private final SecretKey key;

    public JwtTokenProvider(@Value("${JWT_SECRET:}") String secret) {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("JWT_SECRET 환경변수가 필요합니다.");
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String createAccessToken(Long userId, String email, UserRole role) {
        Instant now = Instant.now();
        Instant exp = now.plus(JwtProperties.ACCESS_TOKEN_TTL);

        return Jwts.builder()
                .subject(email)
                .issuedAt(Date.from(now))
                .expiration(Date.from(exp))
                .claim("uid", userId)
                .claim("role", role.name())
                .signWith(key)
                .compact();
    }

    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Long getUserId(Claims claims) {
        Object uid = claims.get("uid");
        if (uid instanceof Integer i) return i.longValue();
        if (uid instanceof Long l) return l;
        if (uid instanceof String s) return Long.valueOf(s);
        throw new IllegalArgumentException("uid claim이 올바르지 않습니다.");
    }

    public UserRole getRole(Claims claims) {
        return UserRole.valueOf(String.valueOf(claims.get("role")));
    }
}


