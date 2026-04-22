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
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class AdminDashboardController {

    @Autowired private UserRepository userRepository;
    @Autowired private BookingRepository bookingRepository;
    @Autowired private TicketRepository ticketRepository;
    @Autowired private StudentRepository studentRepository;

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

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getStudents() {
        List<User> students = userRepository.findByRole(User.Role.USER);
        List<Map<String, Object>> result = new ArrayList<>();
        for (User user : students) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("id", user.getId());
            entry.put("email", user.getEmail());
            entry.put("createdAt", user.getCreatedAt());
            Optional<Student> studentProfile = studentRepository.findByUserId(user.getId());
            entry.put("name", studentProfile.map(Student::getName).orElse(null));
            result.add(entry);
        }
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        User user = userOpt.get();
        if (user.getRole() != User.Role.USER) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        studentRepository.findByUserId(id).ifPresent(studentRepository::delete);
        userRepository.delete(user);
        return ResponseEntity.noContent().build();
    }
}
