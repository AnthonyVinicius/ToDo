package com.anthony.todo.dto;

import jakarta.validation.Validation;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class InputValidationTest {
    private boolean valid(Object request) {
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            return factory.getValidator().validate(request).isEmpty();
        }
    }

    @Test
    void checksTaskLimitsAfterTrimming() {
        assertTrue(valid(new TaskRequest("abc", "abc", 1)));
        assertTrue(valid(new TaskRequest("a".repeat(100), "b".repeat(1000), 3650)));
        assertFalse(valid(new TaskRequest(" a ", "abc", 1)));
        assertFalse(valid(new TaskRequest("abc", "  ", 1)));
        assertFalse(valid(new TaskRequest("a".repeat(101), "abc", 1)));
        assertFalse(valid(new TaskRequest("abc", "b".repeat(1001), 1)));
        assertFalse(valid(new TaskRequest("abc", "abc", 0)));
        assertFalse(valid(new TaskRequest("abc", "abc", 3651)));
        assertFalse(valid(new TaskRequest(null, null, null)));
    }

    @Test
    void checksRegistrationCharacterLimits() {
        assertTrue(valid(new UserRequest("Ana", "ana@example.com", "a".repeat(8))));
        assertTrue(valid(new UserRequest("Ana", "ana@example.com", "a".repeat(72))));
        assertFalse(valid(new UserRequest(" a ", "ana@example.com", "password")));
        assertFalse(valid(new UserRequest("a".repeat(51), "ana@example.com", "password")));
        assertFalse(valid(new UserRequest("Ana", "invalid", "password")));
        assertFalse(valid(new UserRequest("Ana", "ana@example.com", "1234567")));
        assertFalse(valid(new UserRequest("Ana", "ana@example.com", "        ")));
        assertFalse(valid(new UserRequest("Ana", "ana@example.com", "a".repeat(73))));
        assertTrue(valid(new UserRequest("Ana", "ana@example.com", "á".repeat(72))));
        assertFalse(valid(new UserRequest("Ana", "ana@example.com", "á".repeat(73))));
    }

    @Test
    void rejectsOversizedLoginInputs() {
        assertFalse(valid(new LoginRequest("a".repeat(255) + "@example.com", "password")));
        assertFalse(valid(new LoginRequest("ana@example.com", "a".repeat(73))));
        assertTrue(valid(new LoginRequest(" ana@example.com ", "password")));
    }
}
