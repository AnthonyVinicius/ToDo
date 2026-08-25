package com.anthony.todo.dto;

import com.anthony.todo.entity.Status;

public record UpdateTaskStatusRequest (

        Status status
)
{}
