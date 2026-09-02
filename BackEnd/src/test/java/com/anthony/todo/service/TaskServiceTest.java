package com.anthony.todo.service;

import com.anthony.todo.dto.TaskRequest;
import com.anthony.todo.entity.Status;
import com.anthony.todo.entity.Task;
import com.anthony.todo.exception.ResourceNotFoundException;
import com.anthony.todo.mapper.TaskMapper;
import com.anthony.todo.repository.TaskRepository;
import com.anthony.todo.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TaskServiceTest {
    private final TaskRepository repository = mock(TaskRepository.class);
    private final TaskService service = new TaskService(repository, mock(UserRepository.class), new TaskMapper());

    @AfterEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    private UUID authenticate() {
        UUID userId = UUID.randomUUID();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(userId.toString(), null, List.of()));
        return userId;
    }

    @Test
    void updatesOwnedTaskWithoutChangingCreationDateOrStatus() {
        UUID userId = authenticate();
        UUID taskId = UUID.randomUUID();
        Task task = new Task();
        task.setUuid(taskId);
        task.setCreatedAt(LocalDateTime.of(2026, 9, 1, 10, 0));
        task.setStatus(Status.IN_PROGRESS);
        when(repository.findByUuidAndUser_Uuid(taskId, userId)).thenReturn(Optional.of(task));

        var response = service.updateTask(taskId, new TaskRequest("Updated", "Description", 5));

        assertEquals("Updated", response.title());
        assertEquals("Description", response.description());
        assertEquals(task.getCreatedAt().plusDays(5), response.dueAt());
        assertEquals(Status.IN_PROGRESS, response.status());
        assertEquals(LocalDateTime.of(2026, 9, 1, 10, 0), response.createdAt());
    }

    @Test
    void rejectsEditingTasksNotOwnedByLoggedUser() {
        UUID userId = authenticate();
        UUID taskId = UUID.randomUUID();
        when(repository.findByUuidAndUser_Uuid(taskId, userId)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class,
                () -> service.updateTask(taskId, new TaskRequest("Updated", "Description", 5)));
        verify(repository).findByUuidAndUser_Uuid(taskId, userId);
    }
}
