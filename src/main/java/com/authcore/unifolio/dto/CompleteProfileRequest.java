package com.authcore.unifolio.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CompleteProfileRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String studentId;

    private String phone;
    private String department;
}
