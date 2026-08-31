package com.anthony.todo.controller;
import com.anthony.todo.dto.TaskResponse;
import com.anthony.todo.dto.UserRequest;
import com.anthony.todo.dto.UserResponse;
import com.anthony.todo.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @GetMapping()
    public List<UserResponse> getUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{uuid}")
    public UserResponse getUserById(@PathVariable UUID uuid) {
        return userService.getUserById(uuid);
    }

    @GetMapping("/{uuid}/tasks")
    public List<TaskResponse> getUserTasks(@PathVariable UUID uuid) {
        return userService.getUserTasks(uuid);
    }
    @PostMapping()
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserRequest dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(dto));
    }

    @DeleteMapping("/{uuid}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID uuid) {
        userService.deleteUser(uuid);
        return ResponseEntity.noContent().build();
    }
}
