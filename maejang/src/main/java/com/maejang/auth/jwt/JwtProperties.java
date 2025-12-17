package com.maejang.auth.jwt;

import java.time.Duration;

public final class JwtProperties {
    private JwtProperties() {}

    public static final String COOKIE_NAME = "ACCESS_TOKEN";
    public static final Duration ACCESS_TOKEN_TTL = Duration.ofHours(6);
}


