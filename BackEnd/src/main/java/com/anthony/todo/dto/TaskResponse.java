package com.anthony.todo.dto;

import com.anthony.todo.entity.Status;

import java.time.LocalDateTime;
import java.util.UUID;

public record TaskResponse(
        UUID uuid,

        String title,

        String description,

        Status status,

        LocalDateTime createdAt,

        LocalDateTime dueAt
)
{}
