package com.anthony.todo.mapper;

import com.anthony.todo.dto.UserResponse;
import com.anthony.todo.entity.User;
import lombok.experimental.UtilityClass;

@UtilityClass
public class UserMapper {

    public UserResponse toDTO(User user) {
        return new UserResponse(
                user.getUuid(),
                user.getUsername(),
                user.getEmail()
        );
    }
}
