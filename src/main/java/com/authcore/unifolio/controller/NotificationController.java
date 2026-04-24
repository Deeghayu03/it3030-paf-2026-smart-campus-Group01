package com.authcore.unifolio.controller;

import com.authcore.unifolio.entity.Notification;
import com.authcore.unifolio.entity.NotificationPreference;
import com.authcore.unifolio.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    record NotificationDTO(
        Long id,
        String message,
        String type,
        Long referenceId,
        String referenceType,
        boolean isRead,
        String createdAt
    ) {}

    public record PreferenceDTO(
            Long id,
            String category,
            Boolean enabled
    ) {}


    private PreferenceDTO toPrefDTO(NotificationPreference p) {
        return new PreferenceDTO(
                p.getId(),
                p.getCategory(),
                p.getEnabled()
        );
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyNotifications(Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).build();
            }
            String email = authentication.getName();
            List<Notification> notifications = notificationService.getMyNotifications(email);

            List<NotificationDTO> dtos = notifications.stream()
                .map(n -> new NotificationDTO(
                    n.getId(),
                    n.getMessage(),
                    n.getType() != null ? n.getType().name() : null,
                    n.getReferenceId(),
                    n.getReferenceType(),
                    n.getIsRead() != null ? n.getIsRead() : false,
                    n.getCreatedAt() != null ? n.getCreatedAt().toString() : null
                ))
                .collect(Collectors.toList());

            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body("Error: " + e.getClass().getName() + ": " + e.getMessage());
        }
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        String email = authentication.getName();
        long count = notificationService.getUnreadCount(email);
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Map<String, String>> markAsRead(
            @PathVariable Long id) {
        notificationService.markAsRead(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Notification marked as read");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead(
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        notificationService.markAllAsRead(authentication.getName());
        Map<String, String> response = new HashMap<>();
        response.put("message", "All notifications marked as read");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteNotification(
            @PathVariable Long id, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        notificationService.deleteNotification(id, authentication.getName());
        Map<String, String> response = new HashMap<>();
        response.put("message", "Notification deleted");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/clear-read")
    public ResponseEntity<Map<String, String>> clearReadNotifications(
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        notificationService.clearReadNotifications(authentication.getName());
        Map<String, String> response = new HashMap<>();
        response.put("message", "Read notifications cleared");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/preferences")
    public ResponseEntity<List<PreferenceDTO>> getPreferences(
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(
                notificationService.getPreferences(authentication.getName())
                        .stream()
                        .map(this::toPrefDTO)
                        .collect(Collectors.toList())
        );
    }

    @PutMapping("/preferences/{category}/toggle")
    public ResponseEntity<PreferenceDTO> togglePreference(
            @PathVariable String category, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(
                toPrefDTO(notificationService.togglePreference(
                        authentication.getName(), category))
        );
    }
}