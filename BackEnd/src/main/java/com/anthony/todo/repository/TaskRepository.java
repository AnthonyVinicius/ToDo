package com.anthony.todo.repository;
import com.anthony.todo.entity.Task;
import java.util.UUID;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {

    List<Task> findAllByUser_Uuid(UUID userId);

    Optional<Task> findByUuidAndUser_Uuid(UUID taskId, UUID userId);
}
