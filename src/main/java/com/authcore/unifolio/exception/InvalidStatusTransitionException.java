package com.authcore.unifolio.exception;

/**
 * Thrown when a status transition is not allowed by the workflow.
 * Maps to HTTP 400 Bad Request.
 */
public class InvalidStatusTransitionException extends RuntimeException {
    public InvalidStatusTransitionException(Object from, Object to) {
        super("Cannot transition ticket from " + from + " to " + to);
    }
}
