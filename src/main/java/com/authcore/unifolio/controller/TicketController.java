package com.authcore.unifolio.controller;

import com.authcore.unifolio.entity.Ticket;
import com.authcore.unifolio.entity.TicketComment;
import com.authcore.unifolio.entity.User;
import com.authcore.unifolio.entity.Resource;
import com.authcore.unifolio.repo.TicketRepository;
import com.authcore.unifolio.repo.TicketCommentRepository;
import com.authcore.unifolio.repo.ResourceRepository;
import com.authcore.unifolio.dto.TicketDTO;
import com.authcore.unifolio.dto.CommentDTO;
import com.authcore.unifolio.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:*"})
public class TicketController {

    private final TicketService ticketService;
    private final ResourceRepository resourceRepository;

    // Get current user's tickets
    @GetMapping("/my-tickets")
    public ResponseEntity<List<Ticket>> getMyTickets(@AuthenticationPrincipal User user) {
        try {
            List<Ticket> tickets = ticketService.getUserTickets(user.getEmail());
            return ResponseEntity.ok(tickets);
        } catch (Exception e) {
            System.err.println("Error in getMyTickets: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    // Create a new ticket with file attachments
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<Ticket> createTicketWithFiles(
            @RequestPart("ticket") String ticketDTOJson,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            @AuthenticationPrincipal User user) {
        
        try {
            // Convert JSON to TicketDTO
            TicketDTO ticketDTO = new com.fasterxml.jackson.databind.ObjectMapper().readValue(ticketDTOJson, TicketDTO.class);
            
            Ticket ticket = ticketService.createTicket(ticketDTO, user);
            
            // Handle file attachments if provided
            if (files != null && !files.isEmpty()) {
                for (MultipartFile file : files) {
                    if (!file.isEmpty()) {
                        ticketService.addAttachment(ticket.getId(), file);
                    }
                }
                // Reload ticket with attachments
                ticket = ticketService.getTicketById(ticket.getId());
            }
            
            return ResponseEntity.ok(ticket);
        } catch (Exception e) {
            System.err.println("Error in createTicketWithFiles: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    // Create a new ticket (JSON only, for compatibility)
    @PostMapping(consumes = "application/json")
    public ResponseEntity<Ticket> createTicket(
            @Valid @RequestBody TicketDTO ticketDTO,
            @AuthenticationPrincipal User user) {
        
        Ticket ticket = ticketService.createTicket(ticketDTO, user);
        return ResponseEntity.ok(ticket);
    }

    // Add comment to a ticket
    @PostMapping("/{id}/comments")
    public ResponseEntity<Ticket> addComment(
            @PathVariable Long id,
            @Valid @RequestBody CommentDTO commentDTO,
            @AuthenticationPrincipal User user) {
        
        Ticket ticket = ticketService.addComment(id, commentDTO, user);
        return ResponseEntity.ok(ticket);
    }

    // Get ticket details
    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicket(@PathVariable Long id, @AuthenticationPrincipal User user) {
        Ticket ticket = ticketService.getTicket(id, user);
        return ResponseEntity.ok(ticket);
    }

    // Get resources by category
    @GetMapping("/resources/{category}")
    public ResponseEntity<List<Resource>> getResourcesByCategory(@PathVariable String category) {
        try {
            Resource.ResourceType resourceType;
            switch (category.toUpperCase()) {
                case "EQUIPMENT":
                    resourceType = Resource.ResourceType.EQUIPMENT;
                    break;
                case "LECTURE_HALL":
                    resourceType = Resource.ResourceType.LECTURE_HALL;
                    break;
                case "LAB":
                    resourceType = Resource.ResourceType.LAB;
                    break;
                case "MEETING_ROOM":
                    resourceType = Resource.ResourceType.MEETING_ROOM;
                    break;
                default:
                    return ResponseEntity.badRequest().build();
            }
            
            List<Resource> resources = resourceRepository.findByType(resourceType);
            return ResponseEntity.ok(resources);
        } catch (Exception e) {
            System.err.println("Error in getResourcesByCategory: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}
