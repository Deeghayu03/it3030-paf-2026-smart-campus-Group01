package com.authcore.unifolio.exception;

/**
 * Thrown when a user tries to upload a 4th attachment to a ticket.
 * Maps to HTTP 409 Conflict.
 */
public class AttachmentLimitExceededException extends RuntimeException {
    public AttachmentLimitExceededException() {
        super("Maximum of 3 attachments allowed per ticket");
    }
}
