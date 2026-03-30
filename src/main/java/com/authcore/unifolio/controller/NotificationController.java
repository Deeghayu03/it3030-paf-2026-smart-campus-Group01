package com.authcore.unifolio.controller;

import com.authcore.unifolio.entity.Notification;
import com.authcore.unifolio.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/my")
    public ResponseEntity<List<Notification>> getMyNotifications(
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(
            notificationService.getMyNotifications(email));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            Authentication authentication) {
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
        String email = authentication.getName();
        notificationService.markAllAsRead(email);
        Map<String, String> response = new HashMap<>();
        response.put("message", "All notifications marked as read");
        return ResponseEntity.ok(response);
    }
}
