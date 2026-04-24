package com.authcore.unifolio.dto;

import lombok.Data;

@Data
public class StatusUpdateRequest {
    private String status;
    private String resolutionNotes;
    private String rejectionReason;
    private String assignedToEmail;
}
