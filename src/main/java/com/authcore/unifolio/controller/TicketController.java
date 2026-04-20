package com.authcore.unifolio.controller;

import com.authcore.unifolio.dto.*;
import com.authcore.unifolio.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @PostMapping("/tickets")
    public ResponseEntity<TicketResponse> createTicket(
            @Valid @RequestBody TicketRequest request,
            Authentication authentication) {
        return new ResponseEntity<>(ticketService.createTicket(request, authentication.getName()), HttpStatus.CREATED);
    }

    @GetMapping("/tickets/my")
    public ResponseEntity<List<TicketResponse>> getMyTickets(Authentication authentication) {
        return ResponseEntity.ok(ticketService.getMyTickets(authentication.getName()));
    }

    @GetMapping("/tickets/{id}")
    public ResponseEntity<TicketResponse> getTicketDetail(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(ticketService.getTicketDetail(id, authentication.getName()));
    }

    @PutMapping("/tickets/{id}/status")
    public ResponseEntity<TicketResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(ticketService.updateStatus(id, request, authentication.getName()));
    }

    @PostMapping("/tickets/{id}/attachments")
    public ResponseEntity<List<String>> uploadAttachments(
            @PathVariable Long id,
            @RequestParam("files") MultipartFile[] files,
            Authentication authentication) throws IOException {
        return ResponseEntity.ok(ticketService.uploadAttachments(id, files, authentication.getName()));
    }

    @DeleteMapping("/tickets/attachments/{attachId}")
    public ResponseEntity<Void> deleteAttachment(
            @PathVariable Long attachId,
            Authentication authentication) {
        ticketService.deleteAttachment(attachId, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/tickets/{id}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long id,
            @Valid @RequestBody CommentRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(ticketService.addComment(id, request, authentication.getName()));
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long id,
            Authentication authentication) {
        ticketService.deleteComment(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/tickets/{ticketId}/comments/{commentId}")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            @Valid @RequestBody CommentRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(ticketService.updateComment(commentId, request, authentication.getName()));
    }

    @DeleteMapping("/tickets/{ticketId}/comments/{commentId}")
    public ResponseEntity<Void> deleteCommentFromTicket(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            Authentication authentication) {
        ticketService.deleteComment(commentId, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/tickets/{id}/history")
    public ResponseEntity<List<TicketHistoryResponse>> getTicketHistory(
            @PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketHistory(id));
    }

    @GetMapping("/tickets")
    public ResponseEntity<List<TicketResponse>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }
}
