package com.ywes.application_tracker.dto;

import jakarta.persistence.Column;
import org.hibernate.annotations.UpdateTimestamp;

import java.util.Date;

public record UserDTO(
        Integer id,
        String username,
        Date createdAt,
        Date updatedAt
) { }
