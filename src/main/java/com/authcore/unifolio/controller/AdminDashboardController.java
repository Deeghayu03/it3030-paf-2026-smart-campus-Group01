package com.authcore.unifolio.controller;

import com.authcore.unifolio.entity.Booking;
import com.authcore.unifolio.entity.Student;
import com.authcore.unifolio.entity.Ticket;
import com.authcore.unifolio.entity.User;
import com.authcore.unifolio.repo.BookingRepository;
import com.authcore.unifolio.repo.StudentRepository;
import com.authcore.unifolio.repo.TicketRepository;
import com.authcore.unifolio.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class AdminDashboardController {

    @Autowired private UserRepository userRepository;
    @Autowired private BookingRepository bookingRepository;
    @Autowired private TicketRepository ticketRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalTechnicians", userRepository.countByRole(User.Role.TECHNICIAN));
        stats.put("totalStudents", userRepository.countByRole(User.Role.USER));
        stats.put("totalBookings", bookingRepository.count());
        stats.put("totalTickets", ticketRepository.count());

        List<Map<String, Object>> bookingsByStatus = new ArrayList<>();
        for (Booking.BookingStatus s : Booking.BookingStatus.values()) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("name", s.name().charAt(0) + s.name().substring(1).toLowerCase());
            entry.put("value", bookingRepository.countByStatus(s));
            bookingsByStatus.add(entry);
        }
        stats.put("bookingsByStatus", bookingsByStatus);

        List<Map<String, Object>> ticketsByStatus = new ArrayList<>();
        for (Ticket.TicketStatus s : Ticket.TicketStatus.values()) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("name", s.name().replace("_", " ").charAt(0)
                    + s.name().replace("_", " ").substring(1).toLowerCase());
            entry.put("value", ticketRepository.countByStatus(s));
            ticketsByStatus.add(entry);
        }
        stats.put("ticketsByStatus", ticketsByStatus);

        List<Map<String, Object>> userDistribution = new ArrayList<>();
        long students = userRepository.countByRole(User.Role.USER);
        long technicians = userRepository.countByRole(User.Role.TECHNICIAN);
        long admins = userRepository.countByRole(User.Role.ADMIN);

        Map<String, Object> studentsEntry = new HashMap<>();
        studentsEntry.put("name", "Students");
        studentsEntry.put("value", students);
        userDistribution.add(studentsEntry);

        Map<String, Object> techniciansEntry = new HashMap<>();
        techniciansEntry.put("name", "Technicians");
        techniciansEntry.put("value", technicians);
        userDistribution.add(techniciansEntry);

        Map<String, Object> adminsEntry = new HashMap<>();
        adminsEntry.put("name", "Admins");
        adminsEntry.put("value", admins);
        userDistribution.add(adminsEntry);

        stats.put("userDistribution", userDistribution);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users/students")
    public ResponseEntity<List<Map<String, Object>>> getDetailedStudents() {
        List<User> students = userRepository.findByRole(User.Role.USER);
        return ResponseEntity.ok(students.stream().map(u -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("email", u.getEmail());
            map.put("role", u.getRole());
            map.put("createdAt", u.getCreatedAt());
            Optional<Student> profile = studentRepository.findByUserId(u.getId());
            map.put("name", profile.map(Student::getName).orElse(u.getName()));
            return map;
        }).collect(Collectors.toList()));
    }

    @GetMapping("/users/technicians")
    public ResponseEntity<List<Map<String, Object>>> getDetailedTechnicians() {
        List<User> technicians = userRepository.findByRole(User.Role.TECHNICIAN);
        return ResponseEntity.ok(technicians.stream().map(u -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("name", u.getName());
            map.put("email", u.getEmail());
            map.put("role", u.getRole());
            map.put("createdAt", u.getCreatedAt());
            return map;
        }).collect(Collectors.toList()));
    }

    @PostMapping("/users/technicians")
    public ResponseEntity<?> createTechnician(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already in use");
        }

        User tech = new User();
        tech.setName(request.get("name"));
        tech.setEmail(email);
        tech.setPassword(passwordEncoder.encode(request.get("password")));
        tech.setRole(User.Role.TECHNICIAN);

        User saved = userRepository.save(tech);

        Map<String, Object> response = new HashMap<>();
        response.put("id", saved.getId());
        response.put("name", saved.getName());
        response.put("email", saved.getEmail());
        response.put("role", saved.getRole());
        response.put("createdAt", saved.getCreatedAt());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        User user = userOpt.get();
        // Delete student profile if exists
        studentRepository.findByUserId(id).ifPresent(studentRepository::delete);
        userRepository.delete(user);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getUsageAnalytics() {
        Map<String, Object> analytics = new HashMap<>();

        List<Map<String, Object>> topResources = new ArrayList<>();
        List<Object[]> resourceData = bookingRepository.findTopResources();

        for (Object[] row : resourceData) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("name", row[0]);
            entry.put("value", row[1]);
            topResources.add(entry);
        }

        List<Map<String, Object>> peakBookingHours = new ArrayList<>();
        List<Object[]> hourData = bookingRepository.findPeakBookingHours();

        for (Object[] row : hourData) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("hour", row[0] + ":00");
            entry.put("value", row[1]);
            peakBookingHours.add(entry);
        }

        analytics.put("topResources", topResources);
        analytics.put("peakBookingHours", peakBookingHours);

        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/technicians")
    public ResponseEntity<?> getTechnicians() {
        List<User> technicians = userRepository.findByRole(User.Role.TECHNICIAN);
        List<Map<String, Object>> result = technicians.stream()
            .map(t -> {
                Map<String, Object> map = new HashMap<>();
                map.put("email", t.getEmail());
                map.put("name", t.getName() != null ? t.getName() : t.getEmail());
                return map;
            })
            .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }
}
