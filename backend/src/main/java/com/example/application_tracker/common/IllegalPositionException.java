package com.example.application_tracker.common;

public class IllegalPositionException extends RuntimeException {
    public IllegalPositionException(String errorMessage) {
        super(errorMessage);
    }
}
