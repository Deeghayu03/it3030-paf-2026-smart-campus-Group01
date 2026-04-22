package com.authcore.unifolio.dto;

import com.authcore.unifolio.entity.Booking;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BookingResponseDTO {
    private Long id;
    private Long userId;
    private String userEmail;
    private String userName;
    private Long resourceId;
    private String resourceName;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate bookingDate;

    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime startTime;

    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime endTime;

    private String purpose;
    private Booking.BookingStatus status;
    private String rejectionReason;
    private String rejectedReason;
    private String cancellationReason;
    private String role;
    private String userRole;
    private Boolean isAdminBooking;
    private LocalDateTime createdAt;
    
    // For conflict suggestions
    private List<TimeSlotDTO> suggestions;
    private String message;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TimeSlotDTO {
        private String startTime;
        private String endTime;
    }
}
