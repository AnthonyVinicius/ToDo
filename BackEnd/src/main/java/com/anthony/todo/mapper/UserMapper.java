package com.anthony.todo.mapper;

import com.anthony.todo.dto.UserRequest;
import com.anthony.todo.dto.UserResponse;
import com.anthony.todo.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse toDTO(User user) {
        return new UserResponse(
                user.getUuid(),
                user.getUsername(),
                user.getEmail()
        );
    }

    public User toEntity(UserRequest userRequest) {
        User user = new User();

        user.setEmail(userRequest.email());
        user.setUsername(userRequest.username());
        user.setPassword(userRequest.password());

        return user;
    }
}