package com.anthony.todo.controller;

import com.anthony.todo.dto.TaskRequest;
import com.anthony.todo.dto.TaskResponse;
import com.anthony.todo.entity.Task;
import com.anthony.todo.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping()
    public List<TaskResponse> getAllTasks() {
    return taskService.getAllTasks();
    }

    @GetMapping("/{uuid}")
    public TaskResponse getTaskById(@PathVariable UUID uuid) {
        return taskService.getTaskById(uuid);
    }

    @PostMapping()
    public TaskResponse createTask(@RequestBody TaskRequest task) {
        return taskService.createTask(task);
    }

    @DeleteMapping("/{uuid}")
    public void deleteTask(@PathVariable UUID uuid) {
        taskService.deleteTask(uuid);
    }

}
