package com.authcore.unifolio.exception;

/**
 * Thrown when an uploaded file is not one of the allowed image types.
 * Maps to HTTP 400 Bad Request.
 */
public class InvalidFileTypeException extends RuntimeException {
    public InvalidFileTypeException(String fileType) {
        super("File type '" + fileType + "' is not allowed. Accepted types: JPEG, PNG, WEBP");
    }
}
