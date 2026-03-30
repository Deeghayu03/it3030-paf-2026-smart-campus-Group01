package com.authcore.unifolio.dto;

import lombok.Data;

@Data
public class AuthResponse {
    private String message;
    private String token;
    private String role;
    private String email;
    private String name;
    private boolean success;
}
