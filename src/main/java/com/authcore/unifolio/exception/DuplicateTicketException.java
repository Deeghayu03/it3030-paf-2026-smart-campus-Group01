package com.authcore.unifolio.exception;

/**
 * Thrown when a user submits a ticket for a resource + category
 * that already has an open or in-progress ticket.
 * Maps to HTTP 409 Conflict.
 */
public class DuplicateTicketException extends RuntimeException {

    private final Long existingTicketId;

    public DuplicateTicketException(Long existingTicketId) {
        super("A similar open ticket already exists (ID: " + existingTicketId + ")");
        this.existingTicketId = existingTicketId;
    }

    public Long getExistingTicketId() {
        return existingTicketId;
    }
}
