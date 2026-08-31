package com.anthony.todo.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TaskRequest(

        @NotBlank(message = "Title is required")
        @Size(max = 100, message = "Title must have at most 100 characters")
        String title,

        @NotBlank(message = "Description is required")
        @Size(max = 1000, message = "Description must have at most 1000 characters")
        String description,

        @NotNull(message = "Deadline is required")
        @Min(value = 1, message = "Deadline must be at least 1 day")
        @Max(value = 3650, message = "Deadline must be at most 3650 days")
        Integer deadlineInDays
)
{}
