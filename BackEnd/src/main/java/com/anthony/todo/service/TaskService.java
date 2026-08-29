package com.anthony.todo.service;

import com.anthony.todo.dto.TaskRequest;
import com.anthony.todo.dto.TaskResponse;
import com.anthony.todo.entity.Task;
import com.anthony.todo.mapper.TaskMapper;
import com.anthony.todo.repository.TaskRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TaskService {

    public final TaskRepository taskRepository;
    public final TaskMapper mapper;

    @Transactional
    public List<TaskResponse> getAllTasks() {
        return taskRepository.findAll()
                .stream()
                .map(mapper::toDTO)
                .toList();
    }

    @Transactional
    public TaskResponse getTaskById(UUID uuid) {
        Task task = findTaskById(uuid);
        return mapper.toDTO(task);
    }

    @Transactional
    public TaskResponse createTask(TaskRequest dto) {
        Task task = mapper.toEntity(dto);

        Task savedTask = taskRepository.save(task);

        return mapper.toDTO(savedTask);
    }

    @Transactional
    public void deleteTask(UUID uuid) {
        Task task = findTaskById(uuid);
        taskRepository.delete(task);
    }

    private Task findTaskById(UUID uuid) {
        return taskRepository.findById(uuid)
                .orElseThrow(() -> new RuntimeException("Task not found."));
    }
}
