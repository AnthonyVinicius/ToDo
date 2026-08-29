package com.anthony.todo.service;

import com.anthony.todo.dto.TaskResponse;
import com.anthony.todo.dto.UserRequest;
import com.anthony.todo.dto.UserResponse;
import com.anthony.todo.entity.User;
import com.anthony.todo.mapper.TaskMapper;
import com.anthony.todo.mapper.UserMapper;
import com.anthony.todo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repository;
    private final UserMapper userMapper;
    private final TaskMapper taskMapper;

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return repository.findAll()
                .stream()
                .map(userMapper::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID id) {
        User user = findUserById(id);
        return userMapper.toDTO(user);
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getUserTasks(UUID id) {
        User user = findUserById(id);

        return user.getTasks()
                .stream()
                .map(taskMapper::toDTO)
                .toList();
    }

    @Transactional
    public UserResponse createUser(UserRequest dto) {

        User user = userMapper.toEntity(dto);

        User savedUser = repository.save(user);

        return userMapper.toDTO(savedUser);
    }

    @Transactional
    public void deleteUser(UUID id) {
        User user = findUserById(id);

        repository.delete(user);
    }

    private User findUserById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found."));
    }
}