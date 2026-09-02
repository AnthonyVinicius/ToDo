package com.anthony.todo.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {
    private static final String TEST_SECRET = "test-only-secret-with-at-least-32-characters";
    private final JwtService service = new JwtService(TEST_SECRET, 3600000);

    @Test
    void authenticatesTokenWithoutPermissionClaims() {
        UUID userId = UUID.randomUUID();
        String token = service.generateToken(userId, "Test User");

        assertTrue(service.isTokenValid(token));
        assertEquals(userId, service.extractUserId(token));
        assertEquals("Test User", service.extractUserName(token));

        var claims = Jwts.parser()
                .verifyWith(Keys.hmacShaKeyFor(TEST_SECRET.getBytes(StandardCharsets.UTF_8)))
                .build()
                .parseSignedClaims(token)
                .getPayload();
        assertEquals(java.util.Set.of("sub", "name", "iat", "exp"), claims.keySet());
    }

    @Test
    void rejectsExpiredToken() {
        var expiredService = new JwtService(TEST_SECRET, -60000);
        String token = expiredService.generateToken(UUID.randomUUID(), "Test User");

        assertFalse(service.isTokenValid(token));
    }

    @Test
    void rejectsTokenSignedWithAnotherKey() {
        var otherService = new JwtService("another-test-only-secret-with-at-least-32-characters", 3600000);
        String token = otherService.generateToken(UUID.randomUUID(), "Test User");

        assertFalse(service.isTokenValid(token));
    }
}
