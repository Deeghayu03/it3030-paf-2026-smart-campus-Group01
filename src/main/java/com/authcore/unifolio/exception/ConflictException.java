package com.authcore.unifolio.exception;

import java.util.List;
import java.util.Map;

public class ConflictException extends RuntimeException {
    private final List<Map<String, String>> suggestions;

    public ConflictException(String message, List<Map<String, String>> suggestions) {
        super(message);
        this.suggestions = suggestions;
    }

    public List<Map<String, String>> getSuggestions() {
        return suggestions;
    }
}
