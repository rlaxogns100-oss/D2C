package com.maejang.auth.controller;

public record AuthMeResponse(
        Long userId,
        String email
) {
}


