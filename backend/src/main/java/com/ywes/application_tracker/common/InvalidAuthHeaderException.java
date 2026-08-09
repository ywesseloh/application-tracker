package com.ywes.application_tracker.common;

public class InvalidAuthHeaderException extends RuntimeException {
    public InvalidAuthHeaderException(String message) {
        super(message);
    }
}
