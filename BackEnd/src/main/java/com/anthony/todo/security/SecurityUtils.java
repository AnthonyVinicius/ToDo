package com.anthony.todo.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

public class SecurityUtils {

    private SecurityUtils() {
    }

    public static UUID getLoggedUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() == null
                || "anonymousUser".equals(auth.getPrincipal())) {
            throw new RuntimeException("Usuário não autenticado");
        }

        return UUID.fromString(auth.getPrincipal().toString());
    }
}
