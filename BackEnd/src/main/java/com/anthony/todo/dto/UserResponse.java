package com.anthony.todo.dto;

import java.util.UUID;

public record UserResponse(

        UUID uuid,

        String username,

        String email
)
{}
