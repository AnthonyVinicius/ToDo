package com.anthony.todo.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    private final SecretKey key;
    private final long expirationMs;

    public JwtService(@Value("${security.jwt.secret}") String secret,
                      @Value("${security.jwt.expiration-ms}") long expirationMs) {
        if (secret == null || secret.length() < 32) {
            throw new IllegalArgumentException("security.jwt.secret deve ter pelo menos 32 caracteres");
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public String generateToken(UUID userId, String userName, String role) {
        Date issuedAt = new Date();
        Date expiresAt = new Date(issuedAt.getTime() + expirationMs);

        return Jwts.builder()
                .subject(userId.toString())
                .claim("name", userName)
                .claim("role", role)
                .issuedAt(issuedAt)
                .expiration(expiresAt)
                .signWith(key)
                .compact();
    }

    public String generateToken(UUID userId, String userName) {
        return generateToken(userId, userName, "USER");
    }

    public UUID extractUserId(String token) {
        return UUID.fromString(getClaims(token).getSubject());
    }

    public String extractUserName(String token) {
        return getClaims(token).get("name", String.class);
    }

    public String extractRole(String token) {
        return getClaims(token).get("role", String.class);
    }

    public boolean isTokenValid(String token) {
        try {
            Claims claims = getClaims(token);
            return claims.getSubject() != null
                    && claims.get("name") != null
                    && claims.get("role") != null;
        } catch (Exception ex) {
            return false;
        }
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
