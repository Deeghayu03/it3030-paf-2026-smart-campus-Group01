/*
 * ============================================
 * AUTH FLOW:
 * 1. User submits login form (LoginPage.jsx)
 * 2. authService.login() sends POST /api/auth/login
 * 3. AuthController.login() receives request
 * 4. AuthService.login() validates credentials
 * 5. JwtUtil.generateToken() creates JWT
 * 6. Response sent back to frontend
 * 7. AuthContext stores token in localStorage
 * 8. axiosConfig.js attaches token to all future requests
 * ============================================
 */

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

/**
 * FLOW: AuthController → AuthService → UserRepository → JwtUtil → Response
 *
 * This controller handles authentication-related requests including registration, 
 * login, email availability checks, and profile completion for OAuth users.
 */
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

    /**
     * ENDPOINT: POST /api/auth/register
     * ACCESS: Public
     * FLOW: Receives RegisterRequest → AuthService.registerStudent() → Database persistence → returns Success/Error
     *
     * @param request contains student details, email, password, etc.
     * @return AuthResponse containing status message and registration results
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody @Valid RegisterRequest request) {
        try {
            // Delegating registration logic to service layer
            AuthResponse response = authService.registerStudent(request);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            // Handle registration errors (e.g., duplicate email)
            AuthResponse error = new AuthResponse();
            error.setSuccess(false);
            error.setMessage(e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * ENDPOINT: POST /api/auth/login
     * ACCESS: Public
     * FLOW: Receives credentials → AuthService.loginStudent() → JwtUtil.generateToken() → returns JWT
     *
     * @param request contains email and password
     * @return AuthResponse containing JWT token and user details
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody @Valid LoginRequest request) {
        try {
            // Delegating login and token generation to service layer
            AuthResponse response = authService.loginStudent(request);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (RuntimeException e) {
            // Handle authentication failures
            AuthResponse error = new AuthResponse();
            error.setSuccess(false);
            error.setMessage(e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
        }
    }

    /**
     * ENDPOINT: GET /api/auth/check-email
     * ACCESS: Public
     * FLOW: Receives email → UserRepository binary check → returns boolean
     * 
     * Used for real-time validation during registration.
     *
     * @param email The email to check
     * @return Boolean true if email exists, false otherwise
     */
    @GetMapping("/check-email")
    public ResponseEntity<Boolean> checkEmail(@RequestParam String email) {
        boolean exists = userRepository.existsByEmail(email);
        return ResponseEntity.ok(exists);
    }

    /**
     * ENDPOINT: POST /api/auth/complete-profile
     * ACCESS: Authenticated (OAuth Users)
     * FLOW: Authenticated User → AuthService.completeProfile() → Student profile creation → returns updated AuthResponse
     *
     * Used by users who logged in via Google but still need to provide student-specific details.
     *
     * @param request Student metadata (ID, department, etc.)
     * @param authentication The current security context
     * @return AuthResponse containing the finalized user profile info
     */
    @PostMapping("/complete-profile")
    public ResponseEntity<AuthResponse> completeProfile(
            @RequestBody @Valid CompleteProfileRequest request,
            Authentication authentication) {
        try {
            // Extracting identity from the JWT authentication context
            String email = authentication.getName();
            AuthResponse response = authService.completeProfile(email, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // Handle profile completion failures
            AuthResponse error = new AuthResponse();
            error.setSuccess(false);
            error.setMessage(e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }
    }
}
