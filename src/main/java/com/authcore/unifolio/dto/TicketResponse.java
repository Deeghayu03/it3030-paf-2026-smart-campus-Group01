package com.authcore.unifolio.dto;

import com.authcore.unifolio.entity.Ticket;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class TicketResponse {
    private Long id;
    private String reportedByEmail;
    private String reportedByName;
    private String assignedToEmail;
    private String assignedToName;
    private String location;
    private Ticket.TicketCategory category;
    private String description;
    private Ticket.TicketPriority priority;
    private Ticket.TicketStatus status;
    private String contactDetails;
    private String resolutionNotes;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime slaDeadline;
    private List<CommentResponse> comments;
    private List<String> attachmentPaths;
}
