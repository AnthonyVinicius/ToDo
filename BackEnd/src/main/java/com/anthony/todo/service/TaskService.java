package com.anthony.todo.service;

import com.anthony.todo.entity.Task;
import com.anthony.todo.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TaskService {

    public final TaskRepository taskRepository;

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public Task getTaskById(UUID uuid) {
        return taskRepository.findById(uuid).orElse(null);
    }

    public Task createTask(Task task) {
        return taskRepository.save(task);
    }

    public void deleteTask(UUID uuid) {
        taskRepository.deleteById(uuid);
    };
}
