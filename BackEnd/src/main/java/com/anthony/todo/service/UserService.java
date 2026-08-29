package com.anthony.todo.service;

import com.anthony.todo.dto.TaskResponse;
import com.anthony.todo.dto.UserRequest;
import com.anthony.todo.dto.UserResponse;
import com.anthony.todo.entity.User;
import com.anthony.todo.exception.ConflictException;
import com.anthony.todo.exception.ResourceNotFoundException;
import com.anthony.todo.mapper.TaskMapper;
import com.anthony.todo.mapper.UserMapper;
import com.anthony.todo.repository.UserRepository;
import com.anthony.todo.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        User user = findUserById(SecurityUtils.getLoggedUserId());
        return List.of(userMapper.toDTO(user));
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID id) {
        ensureLoggedUser(id);
        User user = findUserById(id);
        return userMapper.toDTO(user);
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getUserTasks(UUID id) {
        ensureLoggedUser(id);
        User user = findUserById(id);

        return user.getTasks()
                .stream()
                .map(taskMapper::toDTO)
                .toList();
    }

    @Transactional
    public UserResponse createUser(UserRequest dto) {
        String email = dto.email().trim().toLowerCase();
        if (repository.existsByEmail(email)) {
            throw new ConflictException("Email is already registered");
        }
        User user = userMapper.toEntity(dto);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(dto.password()));

        User savedUser = repository.save(user);

        return userMapper.toDTO(savedUser);
    }

    @Transactional
    public void deleteUser(UUID id) {
        ensureLoggedUser(id);
        User user = findUserById(id);

        repository.delete(user);
    }

    private User findUserById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void ensureLoggedUser(UUID requestedUserId) {
        if (!SecurityUtils.getLoggedUserId().equals(requestedUserId)) {
            throw new AccessDeniedException("You cannot access another user");
        }
    }
}
