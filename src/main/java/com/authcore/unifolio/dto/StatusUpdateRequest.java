package com.authcore.unifolio.dto;

import com.authcore.unifolio.entity.Ticket;
import lombok.Data;

@Data
public class StatusUpdateRequest {
    private Ticket.TicketStatus status;
    private String resolutionNotes;
    private String rejectionReason;
}
