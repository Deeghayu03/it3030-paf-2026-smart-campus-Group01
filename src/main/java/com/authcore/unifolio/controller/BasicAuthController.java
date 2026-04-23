package com.authcore.unifolio.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:*"}, allowCredentials = "true")
public class BasicAuthController {

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");
        
        // Simple admin authentication
        if ("admin@mail.com".equals(email) && "admin123".equals(password)) {
            Map<String, Object> response = new HashMap<>();
            response.put("token", "admin-token-" + System.currentTimeMillis());
            response.put("id", 1L);
            response.put("email", "admin@mail.com");
            response.put("name", "Admin User");
            response.put("role", "ADMIN");
            return ResponseEntity.ok(response);
        }
        
        // Simple user authentication (for testing)
        if (password != null && password.length() >= 6) {
            Map<String, Object> response = new HashMap<>();
            response.put("token", "user-token-" + System.currentTimeMillis());
            response.put("id", 2L);
            response.put("email", email);
            response.put("name", "Regular User");
            response.put("role", "USER");
            return ResponseEntity.ok(response);
        }
        
        return ResponseEntity.badRequest().body(Map.of("error", "Invalid credentials"));
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> registerRequest) {
        String email = registerRequest.get("email");
        String password = registerRequest.get("password");
        String name = registerRequest.get("name");
        
        // Simple registration validation
        if (email != null && password != null && password.length() >= 6) {
            Map<String, Object> response = new HashMap<>();
            response.put("token", "user-token-" + System.currentTimeMillis());
            response.put("id", System.currentTimeMillis());
            response.put("email", email);
            response.put("name", name != null ? name : "User");
            response.put("role", "USER");
            return ResponseEntity.ok(response);
        }
        
        return ResponseEntity.badRequest().body(Map.of("error", "Invalid registration data"));
    }
}
