package com.anthony.todo.dto;

import com.anthony.todo.entity.Status;

public record TaskResponse(
        String title,

        String description,

        Status status
)
{}
