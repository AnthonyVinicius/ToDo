package com.anthony.todo.controller;

import com.anthony.todo.dto.TaskRequest;
import com.anthony.todo.dto.TaskResponse;
import com.anthony.todo.dto.UpdateTaskStatusRequest;
import com.anthony.todo.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<TaskResponse> createTask(@Valid @RequestBody TaskRequest task) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.createTask(task));
    }

    @DeleteMapping("/{uuid}")
    public ResponseEntity<Void> deleteTask(@PathVariable UUID uuid) {
        taskService.deleteTask(uuid);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{uuid}/status")
    public TaskResponse updateStatus(@PathVariable UUID uuid,
                                     @Valid @RequestBody UpdateTaskStatusRequest request) {
        return taskService.updateStatus(uuid, request);
    }

}
