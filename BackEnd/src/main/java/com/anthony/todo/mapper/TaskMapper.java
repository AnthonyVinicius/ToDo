package com.anthony.todo.mapper;

import com.anthony.todo.dto.TaskRequest;
import com.anthony.todo.dto.TaskResponse;
import com.anthony.todo.entity.Status;
import com.anthony.todo.entity.Task;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class TaskMapper {

    public TaskResponse toDTO (Task task){
        return new TaskResponse(
                task.getUuid(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getCreatedAt(),
                task.getDueAt()
        );
    }


    public Task toEntity(TaskRequest taskRequest){
        Task task = new Task();
        task.setTitle(taskRequest.title());
        task.setDescription(taskRequest.description());
        task.setStatus(Status.PENDING);
        LocalDateTime createdAt = LocalDateTime.now();
        task.setCreatedAt(createdAt);
        task.setDueAt(createdAt.plusDays(taskRequest.deadlineInDays()));

        return task;
    }

}
