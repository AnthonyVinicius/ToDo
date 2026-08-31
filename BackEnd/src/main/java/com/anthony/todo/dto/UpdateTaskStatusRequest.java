package com.anthony.todo.dto;

import com.anthony.todo.entity.Status;
import jakarta.validation.constraints.NotNull;

public record UpdateTaskStatusRequest (

        @NotNull(message = "Status is required") Status status
)
{}
