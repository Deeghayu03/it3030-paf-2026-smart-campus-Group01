package com.authcore.unifolio.exception;

/**
 * Thrown when a ticket, comment, or attachment is not found in the database.
 * Maps to HTTP 404 Not Found.
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String resourceType, Object id) {
        super(resourceType + " not found with id: " + id);
    }
}
