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

    @Column(columnDefinition = "boolean default false")
    private boolean isRead = false;

    private Long referenceId;
    private String referenceType;
    private LocalDateTime createdAt;

    public enum NotificationType {
        BOOKING_APPROVED, BOOKING_REJECTED, BOOKING_CANCELLED,
        TICKET_UPDATED, TICKET_ASSIGNED, TICKET_RESOLVED, NEW_COMMENT
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.isRead = false;
    }
}
