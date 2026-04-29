/*
 * ============================================
 * NOTIFICATION ENTITY FLOW:
 * 1. Action occurs (Ticket assigned, resolve etc.)
 * 2. Notification object instantiated
 * 3. Linked to a User and given a Message + Type
 * 4. Reference ID added to point to original object
 * 5. Persisted to "notifications" table
 * ============================================
 */

package com.authcore.unifolio.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * ENTITY: Notification
 * ROLE: Persistent user alert
 *
 * This entity stores system-generated messages for users, tracking 
 * their read status and providing context for navigation.
 */
@Data
@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"password", "hibernateLazyInitializer", "handler"})
    private User user;

    @Column(nullable = false)
    private String message;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    @Column(name = "is_read")
    private Boolean isRead = false;

    // Optional pointers to other system objects (like Ticket ID)
    private Long referenceId;
    private String referenceType;
    
    private LocalDateTime createdAt;

    /**
     * Categories of system events that trigger notifications.
     */
    public enum NotificationType {
        BOOKING_PENDING,
        BOOKING_APPROVED, BOOKING_REJECTED, BOOKING_CANCELLED,
        TICKET_UPDATED, TICKET_ASSIGNED, TICKET_RESOLVED, TICKET_REJECTED, NEW_COMMENT, NEW_TICKET
    }

    /**
     * Entity lifecycle hook to set creation timestamp.
     */
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (isRead == null) isRead = false;
    }
}

