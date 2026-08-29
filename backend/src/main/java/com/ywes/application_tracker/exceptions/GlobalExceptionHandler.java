package com.ywes.application_tracker.exceptions;

import com.ywes.application_tracker.dto.ErrorResponse;
import com.ywes.application_tracker.dto.ErrorType;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ErrorResponse handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
        List<String> messageList = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getDefaultMessage() != null
                        ? error.getDefaultMessage()
                        : error.getField() + " is invalid")
                .toList();

        return new ErrorResponse(
                ErrorType.INVALID_REQUEST_BODY,
                String.join(", ", messageList)
        );

    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(ConstraintViolationException.class)
    public ErrorResponse handleConstraintViolationExceptions(ConstraintViolationException ex) {
        List<String> messageList =  ex.getConstraintViolations().stream()
                .map(ConstraintViolation::getMessage)
                .toList();
        return new ErrorResponse(
                ErrorType.INVALID_REQUEST_BODY,
                String.join(", ", messageList)
        );
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(IllegalPositionException.class)
    public ErrorResponse handleIllegalPositionException(IllegalPositionException ex) {
        return new ErrorResponse(
                ErrorType.ILLEGAL_COLUMN_POSITION,
                ex.getMessage()
        );
    }

    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ExceptionHandler(ResourceNotFoundException.class)
    public ErrorResponse handleResourceNotFoundException(ResourceNotFoundException ex) {
        return new ErrorResponse(
                ErrorType.RESOURCE_NOT_FOUND,
                ex.getMessage()
        );
    }

    @ResponseStatus(HttpStatus.CONFLICT)
    @ExceptionHandler(DuplicateUsernameException.class)
    public ErrorResponse handleDuplicateUsernameException(DuplicateUsernameException ex) {
        return new ErrorResponse(
                ErrorType.USERNAME_ALREADY_EXISTS,
                ex.getMessage()
        );
    }

    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    @ExceptionHandler(AuthenticationException.class)
    public ErrorResponse handleAuthenticationException(AuthenticationException ex) {
        return new ErrorResponse(
                ErrorType.AUTHENTICATION_FAILED,
                "Invalid credentials"
        );
    }

    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    @ExceptionHandler(BadRefreshTokenException.class)
    public ErrorResponse handleBadRefreshTokenException(BadRefreshTokenException ex) {
        return new ErrorResponse(
                ErrorType.BAD_REFRESH_TOKEN,
                ex.getMessage()
        );
    }
}
