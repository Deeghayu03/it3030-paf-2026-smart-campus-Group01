package com.authcore.unifolio.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String message;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    @Column(name = "is_read")
    private Boolean isRead = false;

    private Long referenceId;
    private String referenceType;
    private LocalDateTime createdAt;

    public enum NotificationType {
        BOOKING_PENDING,
        BOOKING_APPROVED, BOOKING_REJECTED, BOOKING_CANCELLED,
        TICKET_UPDATED, TICKET_ASSIGNED, TICKET_RESOLVED, TICKET_REJECTED, NEW_COMMENT
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (isRead == null) isRead = false;
    }
}
