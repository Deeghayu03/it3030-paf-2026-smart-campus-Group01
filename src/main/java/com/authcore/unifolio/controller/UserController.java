package com.authcore.unifolio.controller;

import com.authcore.unifolio.entity.User;
import com.authcore.unifolio.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/technicians")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<List<TechnicianResponse>> getAllTechnicians() {
        List<User> technicians = userRepository.findByRole(User.Role.TECHNICIAN);
        List<TechnicianResponse> response = technicians.stream()
                .map(t -> new TechnicianResponse(t.getId(), t.getEmail()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    public static record TechnicianResponse(Long id, String email) {}
}
