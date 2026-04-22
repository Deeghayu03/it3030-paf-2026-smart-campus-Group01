package com.authcore.unifolio.controller;

import com.authcore.unifolio.dto.AuthResponse;
import com.authcore.unifolio.dto.CompleteProfileRequest;
import com.authcore.unifolio.dto.LoginRequest;
import com.authcore.unifolio.dto.RegisterRequest;
import com.authcore.unifolio.service.AuthService;
import com.authcore.unifolio.repo.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowedHeaders = "*",
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT})
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody @Valid RegisterRequest request) {
        try {
            AuthResponse response = authService.registerStudent(request);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            AuthResponse error = new AuthResponse();
            error.setSuccess(false);
            error.setMessage(e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody @Valid LoginRequest request) {
        try {
            AuthResponse response = authService.loginStudent(request);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (RuntimeException e) {
            AuthResponse error = new AuthResponse();
            error.setSuccess(false);
            error.setMessage(e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
        }
    }

    @GetMapping("/check-email")
    public ResponseEntity<Boolean> checkEmail(@RequestParam String email) {
        boolean exists = userRepository.existsByEmail(email);
        return ResponseEntity.ok(exists);
    }

    @PostMapping("/complete-profile")
    public ResponseEntity<AuthResponse> completeProfile(
            @RequestBody @Valid CompleteProfileRequest request,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            AuthResponse response = authService.completeProfile(email, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            AuthResponse error = new AuthResponse();
            error.setSuccess(false);
            error.setMessage(e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }
    }
}