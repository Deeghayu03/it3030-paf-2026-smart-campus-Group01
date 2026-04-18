package com.authcore.unifolio.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "tickets")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "reported_by_id")
    private User reportedBy;

    @ManyToOne
    @JoinColumn(name = "assigned_to_id")
    private User assignedTo;

    @ManyToOne
    @JoinColumn(name = "resource_id")
    private Resource resource;

    @Column(nullable = false)
    private String location;

    @Enumerated(EnumType.STRING)
    private TicketCategory category;

    @Column(nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    private TicketPriority priority;

    @Enumerated(EnumType.STRING)
    private TicketStatus status;

    private String contactDetails;
    private String resolutionNotes;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public enum TicketCategory {
        ELECTRICAL, PLUMBING, IT_EQUIPMENT, FURNITURE, OTHER
    }

    public enum TicketPriority {
        LOW, MEDIUM, HIGH, CRITICAL
    }

    public enum TicketStatus {
        OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED;

        public boolean canTransitionTo(TicketStatus newStatus) {
            if (this == newStatus) return true;
            return switch (this) {
                case OPEN -> newStatus == IN_PROGRESS || newStatus == REJECTED || newStatus == CLOSED;
                case IN_PROGRESS -> newStatus == RESOLVED || newStatus == CLOSED;
                case RESOLVED -> newStatus == CLOSED;
                case CLOSED, REJECTED -> false;
            };
        }
    }

    private LocalDateTime slaDeadline;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean slaBreached = false;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = TicketStatus.OPEN;
        }
        if (!this.slaBreached) {
            this.slaBreached = false;
        }
        
        // Initial SLA calculation based on priority
        if (this.priority != null && this.slaDeadline == null) {
            this.slaDeadline = switch (this.priority) {
                case LOW -> createdAt.plusDays(3);
                case MEDIUM -> createdAt.plusDays(2);
                case HIGH -> createdAt.plusHours(24);
                case CRITICAL -> createdAt.plusHours(4);
            };
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
