package com.authcore.unifolio.dto;

import com.authcore.unifolio.entity.Ticket;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TicketHistoryResponse {
    private Long id;
    private Ticket.TicketStatus fromStatus;
    private Ticket.TicketStatus toStatus;
    private String actorName;
    private String actorRole;
    private String notes;
    private LocalDateTime createdAt;
}
