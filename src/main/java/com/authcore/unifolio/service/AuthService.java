/*
 * ============================================
 * AUTH FLOW:
 * 1. AuthController calls AuthService methods
 * 2. AuthService interacts with UserRepository & StudentRepository
 * 3. AuthService uses PasswordEncoder to hash/verify passwords
 * 4. AuthService uses JwtUtil to generate tokens upon successful login
 * 5. Returns AuthResponse to Controller
 * ============================================
 */

package com.authcore.unifolio.service;

import com.authcore.unifolio.entity.User;
import com.authcore.unifolio.entity.Student;
import com.authcore.unifolio.repo.UserRepository;
import com.authcore.unifolio.repo.StudentRepository;
import com.authcore.unifolio.dto.AuthResponse;
import com.authcore.unifolio.dto.LoginRequest;
import com.authcore.unifolio.dto.RegisterRequest;
import com.authcore.unifolio.dto.CompleteProfileRequest;
import com.authcore.unifolio.security.JwtUtil;
import com.authcore.unifolio.security.CustomUserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * FLOW: AuthService → Repository → PasswordEncoder → JwtUtil
 *
 * This service contains the core business logic for authentication,
 * including user registration, login credential verification, and profile completion.
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService customUserDetailsService;

    public AuthService(UserRepository userRepository, StudentRepository studentRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil, CustomUserDetailsService customUserDetailsService) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.customUserDetailsService = customUserDetailsService;
    }

    /**
     * FLOW: Validates uniqueness → Encodes Password → Saves User → Saves Student Profile → Returns Status
     *
     * @param request Data transfer object containing registration details
     * @return AuthResponse with success status and user summary
     */
    public AuthResponse registerStudent(RegisterRequest request) {
        // Business Rule: Email and Student ID must be unique in the system
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        if (studentRepository.existsByStudentId(request.getStudentId())) {
            throw new RuntimeException("Student ID already exists");
        }

        // 1. Create and persist the core User entity with Hashed password
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.USER); // Default role for registrations is USER (Student)
        User savedUser = userRepository.save(user);

        // 2. Create and persist the specific Student profile linked to the User
        Student student = new Student();
        student.setStudentId(request.getStudentId());
        student.setName(request.getName());
        student.setPhone(request.getPhone());
        student.setDepartment(request.getDepartment());
        student.setUser(savedUser);
        studentRepository.save(student);

        // Prepare response
        AuthResponse response = new AuthResponse();
        response.setSuccess(true);
        response.setMessage("Student registered successfully");
        response.setRole(savedUser.getRole().name());
        response.setEmail(savedUser.getEmail());
        response.setName(student.getName());
        return response;
    }

    /**
     * FLOW: Loads UserDetails → Verifies BCrypt Match → Generates JWT → Returns Token
     *
     * @param request Login credentials
     * @return AuthResponse containing valid JWT token
     */
    public AuthResponse loginStudent(LoginRequest request) {
        // Retrieve standard UserDetails for JWT generation
        org.springframework.security.core.userdetails.UserDetails userDetails = 
            customUserDetailsService.loadUserByUsername(request.getEmail());
        
        // Fetch the domain User entity
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Compare incoming plain password with stored BCrypt hash
        if (user.getPassword() == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        // Generate the cryptographically signed JWT
        String token = jwtUtil.generateToken(userDetails);

        AuthResponse response = new AuthResponse();
        response.setSuccess(true);
        response.setMessage("Login successful");
        response.setToken(token);
        response.setRole(user.getRole().name());
        response.setEmail(user.getEmail());
        
        // Populate display name from student profile if it exists
        studentRepository.findByUser(user).ifPresentOrElse(
            student -> response.setName(student.getName()),
            () -> response.setName(user.getEmail())
        );

        return response;
    }

    /**
     * FLOW: Finds User → Validates state → Creates Student link → Returns confirmation
     *
     * @param email User identifying email
     * @param request Missing student profile details
     * @return AuthResponse
     */
    public AuthResponse completeProfile(String email, CompleteProfileRequest request) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        // Prevent double profile creation
        if (studentRepository.existsByUserId(user.getId())) {
            AuthResponse response = new AuthResponse();
            response.setSuccess(true);
            response.setMessage("Profile already completed");
            return response;
        }

        // Logic for creating the student record for social login users
        Student student = new Student();
        student.setName(request.getName());
        student.setStudentId(request.getStudentId());
        student.setPhone(request.getPhone());
        student.setDepartment(request.getDepartment());
        student.setUser(user);
        studentRepository.save(student);

        AuthResponse response = new AuthResponse();
        response.setSuccess(true);
        response.setMessage("Profile completed successfully");
        response.setEmail(email);
        response.setName(request.getName());
        response.setRole(user.getRole().name());
        return response;
    }
}

