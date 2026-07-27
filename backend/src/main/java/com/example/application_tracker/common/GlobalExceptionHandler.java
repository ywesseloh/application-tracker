package com.example.application_tracker.common;

import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(ConstraintViolationException.class)
    public List<String> handleConstraintViolationExceptions(ConstraintViolationException ex) {
        return ex.getConstraintViolations().stream()
                .map(cv -> cv.getMessage())
                .toList();
    }
}
