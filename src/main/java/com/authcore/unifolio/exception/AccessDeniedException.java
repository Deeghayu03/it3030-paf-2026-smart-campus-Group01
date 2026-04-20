package com.authcore.unifolio.exception;

/**
 * Thrown when a user attempts an action they don't have permission for.
 * Maps to HTTP 403 Forbidden.
 */
public class AccessDeniedException extends RuntimeException {
    public AccessDeniedException(String message) {
        super(message);
    }
}
