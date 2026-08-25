package com.anthony.todo.dto;

import com.anthony.todo.entity.Status;

public record TaskRequest(

        String title,

        String description,

        Status status
)
{}
