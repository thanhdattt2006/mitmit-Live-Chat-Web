package com.mitmit.config;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    // Using a hardcoded secret for simplicity in dev, but ideally this should be in application.yaml
    private final SecretKey key = Keys.hmacShaKeyFor("my-32-character-ultra-secure-and-ultra-long-secret".getBytes());

    private final long EXPIRATION_TIME = 86400000L; // 24 hours

    public String generateToken(String userId) {
        return Jwts.builder()
                .subject(userId)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key)
                .compact();
    }
}
