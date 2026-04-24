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

    public AuthResponse registerStudent(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        if (studentRepository.existsByStudentId(request.getStudentId())) {
            throw new RuntimeException("Student ID already exists");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.USER);
        User savedUser = userRepository.save(user);

        Student student = new Student();
        student.setStudentId(request.getStudentId());
        student.setName(request.getName());
        student.setPhone(request.getPhone());
        student.setDepartment(request.getDepartment());
        student.setUser(savedUser);
        studentRepository.save(student);

        AuthResponse response = new AuthResponse();
        response.setSuccess(true);
        response.setMessage("Student registered successfully");
        response.setRole(savedUser.getRole().name());
        response.setEmail(savedUser.getEmail());
        response.setName(student.getName());
        return response;
    }

    public AuthResponse loginStudent(LoginRequest request) {
        org.springframework.security.core.userdetails.UserDetails userDetails = 
            customUserDetailsService.loadUserByUsername(request.getEmail());
        
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getPassword() == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(userDetails);

        AuthResponse response = new AuthResponse();
        response.setSuccess(true);
        response.setMessage("Login successful");
        response.setToken(token);
        response.setRole(user.getRole().name());
        response.setEmail(user.getEmail());
        
        studentRepository.findByUser(user).ifPresentOrElse(
            student -> response.setName(student.getName()),
            () -> response.setName(user.getEmail())
        );

        return response;
    }

    public AuthResponse completeProfile(String email, CompleteProfileRequest request) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        if (studentRepository.existsByUserId(user.getId())) {
            AuthResponse response = new AuthResponse();
            response.setSuccess(true);
            response.setMessage("Profile already completed");
            return response;
        }

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
