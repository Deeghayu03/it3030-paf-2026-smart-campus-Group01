package com.authcore.unifolio.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:*"}, allowCredentials = "true")
public class BasicTicketController {

    private static final List<Map<String, Object>> mockTickets = new ArrayList<>();
    
    static {
        // Initialize with some mock data
        Map<String, Object> ticket1 = new HashMap<>();
        ticket1.put("id", 1L);
        ticket1.put("title", "Login Issue");
        ticket1.put("description", "Cannot login to the system");
        ticket1.put("status", "OPEN");
        ticket1.put("priority", "HIGH");
        ticket1.put("category", "TECHNICAL");
        ticket1.put("createdBy", "user1@example.com");
        ticket1.put("createdAt", new Date());
        ticket1.put("assignedTo", "");
        ticket1.put("comments", new ArrayList<>());
        
        Map<String, Object> ticket2 = new HashMap<>();
        ticket2.put("id", 2L);
        ticket2.put("title", "Password Reset");
        ticket2.put("description", "Need to reset password");
        ticket2.put("status", "IN_PROGRESS");
        ticket2.put("priority", "MEDIUM");
        ticket2.put("category", "ACCOUNT");
        ticket2.put("createdBy", "user2@example.com");
        ticket2.put("createdAt", new Date());
        ticket2.put("assignedTo", "tech1@example.com");
        ticket2.put("comments", new ArrayList<>());
        
        mockTickets.add(ticket1);
        mockTickets.add(ticket2);
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllTickets() {
        return ResponseEntity.ok(mockTickets);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getTicketById(@PathVariable Long id) {
        Optional<Map<String, Object>> ticket = mockTickets.stream()
            .filter(t -> t.get("id").equals(id))
            .findFirst();
        
        return ticket.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateTicketStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        
        Optional<Map<String, Object>> ticketOpt = mockTickets.stream()
            .filter(t -> t.get("id").equals(id))
            .findFirst();
        
        if (ticketOpt.isPresent()) {
            Map<String, Object> ticket = ticketOpt.get();
            ticket.put("status", request.get("status"));
            return ResponseEntity.ok(ticket);
        }
        
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<Map<String, Object>> assignTicket(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        
        Optional<Map<String, Object>> ticketOpt = mockTickets.stream()
            .filter(t -> t.get("id").equals(id))
            .findFirst();
        
        if (ticketOpt.isPresent()) {
            Map<String, Object> ticket = ticketOpt.get();
            ticket.put("assignedTo", request.get("technician"));
            ticket.put("status", "IN_PROGRESS");
            return ResponseEntity.ok(ticket);
        }
        
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<Map<String, Object>> addComment(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        
        Optional<Map<String, Object>> ticketOpt = mockTickets.stream()
            .filter(t -> t.get("id").equals(id))
            .findFirst();
        
        if (ticketOpt.isPresent()) {
            Map<String, Object> ticket = ticketOpt.get();
            List<Map<String, Object>> comments = (List<Map<String, Object>>) ticket.get("comments");
            
            Map<String, Object> comment = new HashMap<>();
            comment.put("id", System.currentTimeMillis());
            comment.put("text", request.get("text"));
            comment.put("author", request.get("author"));
            comment.put("createdAt", new Date());
            
            comments.add(comment);
            ticket.put("comments", comments);
            
            return ResponseEntity.ok(ticket);
        }
        
        return ResponseEntity.notFound().build();
    }
}
