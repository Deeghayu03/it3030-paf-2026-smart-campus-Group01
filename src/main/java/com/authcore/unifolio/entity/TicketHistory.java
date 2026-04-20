package com.authcore.unifolio.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "ticket_history")
public class TicketHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    @Enumerated(EnumType.STRING)
    private Ticket.TicketStatus fromStatus;

    @Enumerated(EnumType.STRING)
    private Ticket.TicketStatus toStatus;

    @ManyToOne
    @JoinColumn(name = "actor_id")
    private User actor;

    private String notes;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
