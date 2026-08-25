package com.anthony.todo.service;
import com.anthony.todo.dto.UserRequest;
import com.anthony.todo.dto.UserResponse;
import com.anthony.todo.entity.User;
import com.anthony.todo.mapper.UserMapper;
import com.anthony.todo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class UserService {

    private final UserRepository repository;

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {

        return repository.findAll()
                .stream()
                .map(UserMapper::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID id) {

        return UserMapper.toDTO(findUserById(id));
    }


    @Transactional
    public UserResponse createUser(UserRequest dto) {

        User user = new User();
        user.setUsername(dto.username());
        user.setEmail(dto.email());
        user.setPassword(dto.password());

        User saved = repository.save(user);

        return UserMapper.toDTO(saved);
    }

    private User findUserById(UUID uuid) {
        return repository.findById(uuid)
                .orElseThrow(() -> {;throw new RuntimeException("User not found.");});
    }

    @Transactional
    public void deleteUser(UUID id) {
        repository.delete(findUserById(id));
    }
}
