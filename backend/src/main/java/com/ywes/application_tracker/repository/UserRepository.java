package com.ywes.application_tracker.repository;

import com.ywes.application_tracker.dto.UserDTO;
import com.ywes.application_tracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    @Query("""
            SELECT new com.ywes.application_tracker.dto.UserDTO(
                u.id, u.username, u.createdAt, u.updatedAt
            )
            FROM User u
            WHERE u.id = :userId
            """)
    Optional<UserDTO> findUserDTOByUserId(Integer userId);
}
