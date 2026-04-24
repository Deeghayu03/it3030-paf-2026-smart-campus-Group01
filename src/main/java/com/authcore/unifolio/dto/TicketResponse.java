package com.authcore.unifolio.dto;

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
    private String category;
    private String description;
    private String priority;
    private String status;
    private String contactDetails;
    private String resolutionNotes;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    private List<CommentResponse> comments;
    private List<String> attachmentPaths;
}
