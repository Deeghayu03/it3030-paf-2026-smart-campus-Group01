package com.authcore.unifolio.dto;

import com.authcore.unifolio.entity.Ticket;
import lombok.Data;

@Data
public class TicketRequest {
    private String location;
    private String description;
    private Ticket.TicketPriority priority;
    private Ticket.TicketCategory category;
    private String contactDetails;
    private Long resourceId;
}
