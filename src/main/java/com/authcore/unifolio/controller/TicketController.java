package com.authcore.unifolio.controller;

import com.authcore.unifolio.dto.*;
import com.authcore.unifolio.entity.Ticket;
import com.authcore.unifolio.entity.User;
import com.authcore.unifolio.repo.TicketRepository;
import com.authcore.unifolio.repo.UserRepository;
import com.authcore.unifolio.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(@RequestBody @Valid TicketRequest request, Authentication authentication) {
        return ResponseEntity.ok(ticketService.createTicket(request, authentication.getName()));
    }

    @GetMapping("/my")
    public ResponseEntity<List<TicketResponse>> getMyTickets(Authentication authentication) {
        return ResponseEntity.ok(ticketService.getMyTickets(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicketDetail(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(ticketService.getTicketDetail(id, authentication.getName()));
    }

    @GetMapping
    public ResponseEntity<List<TicketResponse>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<TicketResponse> updateStatus(@PathVariable Long id, @RequestBody StatusUpdateRequest request, Authentication authentication) {
        return ResponseEntity.ok(ticketService.updateStatus(id, request, authentication.getName()));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponse> addComment(@PathVariable Long id, @RequestBody @Valid CommentRequest request, Authentication authentication) {
        return ResponseEntity.ok(ticketService.addComment(id, request, authentication.getName()));
    }

    @PostMapping("/{id}/attachments")
    public ResponseEntity<List<String>> uploadAttachments(@PathVariable Long id, @RequestParam("files") MultipartFile[] files, Authentication authentication) {
        return ResponseEntity.ok(ticketService.uploadAttachments(id, files, authentication.getName()));
    }

    @DeleteMapping("/attachments/{attachId}")
    public ResponseEntity<Void> deleteAttachment(@PathVariable Long attachId, Authentication authentication) {
        ticketService.deleteAttachment(attachId, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/technician")
    public ResponseEntity<List<TicketResponse>> getTechnicianTickets(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Ticket> tickets = ticketRepository.findByAssignedToOrderByCreatedAtDesc(user);
        
        List<TicketResponse> response = tickets.stream().map(t -> {
            TicketResponse dto = new TicketResponse();
            dto.setId(t.getId());
            if (t.getReportedBy() != null) {
                dto.setReportedByEmail(t.getReportedBy().getEmail());
                dto.setReportedByName(t.getReportedBy().getName());
            }
            if (t.getAssignedTo() != null) {
                dto.setAssignedToEmail(t.getAssignedTo().getEmail());
                dto.setAssignedToName(t.getAssignedTo().getName());
            }
            dto.setLocation(t.getLocation());
            dto.setDescription(t.getDescription());
            dto.setPriority(t.getPriority() != null ? t.getPriority().name() : null);
            dto.setStatus(t.getStatus() != null ? t.getStatus().name() : null);
            dto.setResolutionNotes(t.getResolutionNotes());
            dto.setRejectionReason(t.getRejectionReason());
            dto.setCreatedAt(t.getCreatedAt());
            dto.setUpdatedAt(t.getUpdatedAt());
            return dto;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }
}
