package com.anthony.todo.dto;

public record TaskRequest(

        String title,

        String description,

        Integer deadlineInDays
)
{}
