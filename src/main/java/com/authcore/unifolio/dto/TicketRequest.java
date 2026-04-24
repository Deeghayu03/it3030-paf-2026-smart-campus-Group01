package com.authcore.unifolio.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TicketRequest {
    @NotBlank
    private String location;

    @NotBlank
    private String category;

    @NotBlank
    private String description;

    @NotBlank
    private String priority;

    private String contactDetails;

    private Long resourceId;
}
