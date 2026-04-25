/*
 * ============================================
 * NOTIFICATION FLOW:
 * 1. Action occurs in system (Ticket submission, etc.)
 * 2. NotificationService.createNotification() saves record in DB
 * 3. Frontend Bell polls /unread-count every 30s
 * 4. User clicks bell → calls /notifications/my
 * 5. User interacts with notification → marks as read via PUT /notifications/{id}/read
 * ============================================
 */

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

/**
 * FLOW: NotificationBell → NotificationController → NotificationService → Repository
 *
 * This controller manages asynchronous notification delivery, read status tracking,
 * and user-specific notification preferences.
 */
@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    /**
     * DTO for transferring notification data to frontend without exposing full entity.
     */
    record NotificationDTO(
        Long id,
        String message,
        String type,
        Long referenceId,
        String referenceType,
        boolean isRead,
        String createdAt
    ) {}

    /**
     * DTO for transferring preference data.
     */
    public record PreferenceDTO(
            Long id,
            String category,
            Boolean enabled
    ) {}


    /**
     * Internal helper to convert Preference entity to DTO.
     */
    private PreferenceDTO toPrefDTO(NotificationPreference p) {
        return new PreferenceDTO(
                p.getId(),
                p.getCategory(),
                p.getEnabled()
        );
    }

    /**
     * ENDPOINT: GET /api/notifications/my
     * ACCESS: Authenticated User
     * FLOW: Receives Email → NotificationService.getMyNotifications() → Maps to DTO → Returns list
     *
     * @param authentication The current logged-in user context
     * @return List of all notifications for the user
     */
    @GetMapping("/my")
    public ResponseEntity<?> getMyNotifications(Authentication authentication) {
        try {
            // Validate authentication state
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).build();
            }
            String email = authentication.getName();
            
            // Retrieve entities from service
            List<Notification> notifications = notificationService.getMyNotifications(email);

            // Transform entities to clean DTOs for the frontend
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
            // Capture and log serialization or retrieval errors
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body("Error: " + e.getClass().getName() + ": " + e.getMessage());
        }
    }

    /**
     * ENDPOINT: GET /api/notifications/unread-count
     * ACCESS: Authenticated User
     * FLOW: Receives Email → NotificationService.getUnreadCount() → Returns numeric count
     *
     * @param authentication The current logged-in user context
     * @return Map containing the unread count (e.g. {"count": 5})
     */
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

    /**
     * ENDPOINT: PUT /api/notifications/{id}/read
     * ACCESS: Authenticated User
     * FLOW: Receives ID → NotificationService.markAsRead() → DB Update
     *
     * @param id The primary key of the notification
     * @return Success message
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<Map<String, String>> markAsRead(
            @PathVariable Long id) {
        notificationService.markAsRead(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Notification marked as read");
        return ResponseEntity.ok(response);
    }

    /**
     * ENDPOINT: PUT /api/notifications/read-all
     * ACCESS: Authenticated User
     * FLOW: Receives Email → NotificationService.markAllAsRead() → Batch DB Update
     *
     * @param authentication The current logged-in user context
     * @return Success message
     */
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

    /**
     * ENDPOINT: DELETE /api/notifications/{id}
     * ACCESS: Owner of notification
     * FLOW: Receives ID + Email → NotificationService.deleteNotification() → Removal from DB
     *
     * @param id The notification ID
     * @param authentication The current user context
     * @return Success message
     */
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

    /**
     * ENDPOINT: DELETE /api/notifications/clear-read
     * ACCESS: Authenticated User
     * FLOW: Receives Email → NotificationService.clearReadNotifications() → Batch Deletion
     *
     * @param authentication The current user context
     * @return Success message
     */
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

    /**
     * ENDPOINT: GET /api/notifications/preferences
     * ACCESS: Authenticated User
     * FLOW: Email → NotificationService.getPreferences() → Returns list of flags
     *
     * @param authentication The current user context
     * @return List of current notification preference settings
     */
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

    /**
     * ENDPOINT: PUT /api/notifications/preferences/{category}/toggle
     * ACCESS: Authenticated User
     * FLOW: Email + Category → NotificationService.togglePreference() → DB Flip
     *
     * @param category The notification category (e.g. TICKET, BOOKING)
     * @param authentication The current user context
     * @return Updated preference object
     */
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