package com.ywes.application_tracker.exceptions;

public class IllegalPositionException extends RuntimeException {
    public IllegalPositionException(String errorMessage) {
        super(errorMessage);
    }
}
