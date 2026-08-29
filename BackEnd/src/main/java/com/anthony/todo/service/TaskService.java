package com.anthony.todo.service;

import com.anthony.todo.dto.TaskRequest;
import com.anthony.todo.dto.TaskResponse;
import com.anthony.todo.dto.UpdateTaskStatusRequest;
import com.anthony.todo.entity.Task;
import com.anthony.todo.entity.User;
import com.anthony.todo.exception.ResourceNotFoundException;
import com.anthony.todo.mapper.TaskMapper;
import com.anthony.todo.repository.TaskRepository;
import com.anthony.todo.repository.UserRepository;
import com.anthony.todo.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final TaskMapper mapper;

    @Transactional
    public List<TaskResponse> getAllTasks() {
        return taskRepository.findAllByUser_Uuid(SecurityUtils.getLoggedUserId())
                .stream()
                .map(mapper::toDTO)
                .toList();
    }

    @Transactional
    public TaskResponse getTaskById(UUID uuid) {
        Task task = findOwnedTaskById(uuid);
        return mapper.toDTO(task);
    }

    @Transactional
    public TaskResponse createTask(TaskRequest dto) {
        Task task = mapper.toEntity(dto);
        User user = userRepository.findById(SecurityUtils.getLoggedUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        task.setUser(user);

        Task savedTask = taskRepository.save(task);

        return mapper.toDTO(savedTask);
    }

    @Transactional
    public void deleteTask(UUID uuid) {
        Task task = findOwnedTaskById(uuid);
        taskRepository.delete(task);
    }

    @Transactional
    public TaskResponse updateStatus(UUID uuid, UpdateTaskStatusRequest request) {
        Task task = findOwnedTaskById(uuid);
        task.setStatus(request.status());
        return mapper.toDTO(task);
    }

    private Task findOwnedTaskById(UUID uuid) {
        return taskRepository.findByUuidAndUser_Uuid(uuid, SecurityUtils.getLoggedUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
    }
}
