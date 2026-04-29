package com.authcore.unifolio.service;

import com.authcore.unifolio.dto.BookingRequestDTO;
import com.authcore.unifolio.dto.BookingResponseDTO;
import com.authcore.unifolio.entity.Booking;
import com.authcore.unifolio.entity.Notification;
import com.authcore.unifolio.entity.Resource;
import com.authcore.unifolio.entity.User;
import com.authcore.unifolio.exception.ConflictException;
import com.authcore.unifolio.repo.BookingRepository;
import com.authcore.unifolio.repo.ResourceRepository;
import com.authcore.unifolio.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public BookingResponseDTO createBooking(BookingRequestDTO request) {
        User currentUser = getCurrentUser();
        
        // 4. ADD RESOURCE VALIDATION
        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new RuntimeException("Resource not found"));

        if (resource.getStatus() != Resource.ResourceStatus.ACTIVE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This resource is currently " + resource.getStatus() + " and cannot be booked"
            );
        }
        if (request.getBookingDate() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking date is required");
        }

        // 6. VALIDATE BUSINESS RULES
        if (request.getBookingDate().isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking date cannot be in the past");
        }
        if (request.getEndTime().isBefore(request.getStartTime()) || request.getEndTime().equals(request.getStartTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time must be after start time");
        }

        // 1. FIX CONFLICT EXCEPTION HANDLING
        if (checkConflict(request.getResourceId(), request.getBookingDate(), request.getStartTime(), request.getEndTime(), null)) {
            List<Booking> existingBookings = bookingRepository.findByResourceIdAndBookingDateAndStatusIn(
                    request.getResourceId(),
                    request.getBookingDate(),
                    List.of(Booking.BookingStatus.PENDING, Booking.BookingStatus.APPROVED)
            );
            List<Map<String, String>> suggestions = generateSuggestions(existingBookings, request, resource);
            throw new ConflictException("Time slot already booked", suggestions);
        }

        // VALIDATE RESOURCE AVAILABILITY
        if (resource.getAvailableFrom() != null && request.getStartTime().isBefore(resource.getAvailableFrom())) {
            throw new IllegalArgumentException("Booking time must be within resource available hours: " + resource.getAvailableFrom() + " - " + resource.getAvailableTo());
        }
        if (resource.getAvailableTo() != null && request.getEndTime().isAfter(resource.getAvailableTo())) {
            throw new IllegalArgumentException("Booking time must be within resource available hours: " + resource.getAvailableFrom() + " - " + resource.getAvailableTo());
        }

        Booking booking = new Booking();
        booking.setUser(currentUser);
        booking.setResource(resource);
        booking.setBookingDate(request.getBookingDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());
        if (currentUser.getRole().name().equals("ADMIN")) {
            booking.setStatus(Booking.BookingStatus.APPROVED);
            booking.setIsAdminBooking(true);
        } else {
            booking.setStatus(Booking.BookingStatus.PENDING);
            booking.setIsAdminBooking(false);
        }

        Booking savedBooking = bookingRepository.save(booking);

        if (savedBooking.getStatus() == Booking.BookingStatus.PENDING) {
            List<User> admins = userRepository.findByRole(User.Role.ADMIN);
            for (User admin : admins) {
                notificationService.createNotification(
                        admin,
                        "New booking request from " + currentUser.getEmail() + " for " + resource.getName() + " on " + request.getBookingDate(),
                        Notification.NotificationType.BOOKING_PENDING,
                        savedBooking.getId(),
                        "BOOKING"
                );
            }
        }
        return mapToResponseDTO(savedBooking);
    }

    public boolean checkConflict(Long resourceId, LocalDate date, LocalTime start, LocalTime end, Long excludeId) {
        List<Booking> existingBookings = bookingRepository.findByResourceIdAndBookingDateAndStatusIn(
                resourceId,
                date,
                List.of(Booking.BookingStatus.PENDING, Booking.BookingStatus.APPROVED)
        );

        return existingBookings.stream()
                .filter(existing -> excludeId == null || !existing.getId().equals(excludeId))
                .anyMatch(existing -> 
                        start.isBefore(existing.getEndTime()) && 
                        end.isAfter(existing.getStartTime())
                );
    }

    public List<BookingResponseDTO> getMyBookings() {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        System.out.println("DEBUG: User ID: " + currentUser.getId());
        List<Booking> bookings = bookingRepository.findByUser(currentUser);
        System.out.println("DEBUG: Bookings found for user: " + bookings.size());
        return bookings.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public List<BookingResponseDTO> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAll();
        System.out.println("DEBUG: Total bookings found (Admin): " + bookings.size());
        return bookings.stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    public BookingResponseDTO updateBooking(Long id, BookingRequestDTO request) {
        User currentUser = getCurrentUser();
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (!booking.getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only edit your own bookings");
        }

        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PENDING bookings can be edited");
        }

        // Validation
        if (request.getBookingDate() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking date is required");
        }
        if (request.getBookingDate().isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking date cannot be in the past");
        }
        if (request.getEndTime().isBefore(request.getStartTime()) || request.getEndTime().equals(request.getStartTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time must be after start time");
        }

        // Use new resource ID if provided, otherwise use current
        Resource resourceToValidate = booking.getResource();
        if (request.getResourceId() != null && !request.getResourceId().equals(booking.getResource().getId())) {
            resourceToValidate = resourceRepository.findById(request.getResourceId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));
        }
        if (resourceToValidate.getStatus() != Resource.ResourceStatus.ACTIVE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This resource is currently " + resourceToValidate.getStatus() + " and cannot be booked"
            );
        }

        // Check for conflicts excluding the current booking
        if (checkConflict(resourceToValidate.getId(), request.getBookingDate(), request.getStartTime(), request.getEndTime(), booking.getId())) {
            List<Booking> existingBookings = bookingRepository.findByResourceIdAndBookingDateAndStatusIn(
                    resourceToValidate.getId(),
                    request.getBookingDate(),
                    List.of(Booking.BookingStatus.PENDING, Booking.BookingStatus.APPROVED)
            );
            List<Map<String, String>> suggestions = generateSuggestions(existingBookings, request, resourceToValidate);
            throw new ConflictException("Time slot already booked", suggestions);
        }

        // VALIDATE RESOURCE AVAILABILITY
        if (resourceToValidate.getAvailableFrom() != null && request.getStartTime().isBefore(resourceToValidate.getAvailableFrom())) {
            throw new IllegalArgumentException("Booking time must be within resource available hours: " + resourceToValidate.getAvailableFrom() + " - " + resourceToValidate.getAvailableTo());
        }
        if (resourceToValidate.getAvailableTo() != null && request.getEndTime().isAfter(resourceToValidate.getAvailableTo())) {
            throw new IllegalArgumentException("Booking time must be within resource available hours: " + resourceToValidate.getAvailableFrom() + " - " + resourceToValidate.getAvailableTo());
        }

        // Update resource if changed
        if (request.getResourceId() != null && !request.getResourceId().equals(booking.getResource().getId())) {
            booking.setResource(resourceToValidate);
        }

        booking.setBookingDate(request.getBookingDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());

        return mapToResponseDTO(bookingRepository.save(booking));
    }

    public BookingResponseDTO cancelBooking(Long id, String reason) {
        User currentUser = getCurrentUser();
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        boolean isAdmin = currentUser.getRole().name().equals("ADMIN");

        if (!isAdmin && !booking.getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only cancel your own bookings");
        }

        if (booking.getStatus() == Booking.BookingStatus.REJECTED || booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking is already in a final state (REJECTED/CANCELLED) and cannot be cancelled");
        }


        booking.setStatus(Booking.BookingStatus.CANCELLED);
        booking.setCancellationReason(reason);
        booking.setCancelledAt(java.time.LocalDateTime.now());
        booking.setCancelledBy(currentUser.getRole().name().equals("USER") ? "STUDENT" : currentUser.getRole().name());

        System.out.println("CANCELLED AT: " + booking.getCancelledAt());

        Booking savedBooking = bookingRepository.save(booking);

        if (isAdmin && !booking.getUser().getId().equals(currentUser.getId())) {
            notificationService.createNotification(
                    booking.getUser(),
                    "Your booking for " + booking.getResource().getName() + " on " + booking.getBookingDate() + " has been cancelled by admin." + (reason != null ? " Reason: " + reason : ""),
                    Notification.NotificationType.BOOKING_CANCELLED,
                    savedBooking.getId(),
                    "BOOKING"
            );
        }
        return mapToResponseDTO(savedBooking);
    }

    public BookingResponseDTO approveBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
        
        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PENDING bookings can be approved");
        }
        
        booking.setStatus(Booking.BookingStatus.APPROVED);
        booking.setApprovedAt(java.time.LocalDateTime.now());

        System.out.println("APPROVED AT: " + booking.getApprovedAt());

        Booking savedBooking = bookingRepository.save(booking);
        notificationService.createNotification(
                booking.getUser(),
                "Your booking for " + booking.getResource().getName() + " on " + booking.getBookingDate() + " has been approved!",
                Notification.NotificationType.BOOKING_APPROVED,
                savedBooking.getId(),
                "BOOKING"
        );
        return mapToResponseDTO(savedBooking);
    }

    public BookingResponseDTO rejectBooking(Long id, String reason) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PENDING bookings can be rejected");
        }

        if (reason == null || reason.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rejection reason is required");
        }

        booking.setStatus(Booking.BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        booking.setRejectedReason(reason); // Setting both for compatibility
        booking.setRejectedAt(java.time.LocalDateTime.now());

        System.out.println("REJECTED AT: " + booking.getRejectedAt());

        Booking savedBooking = bookingRepository.save(booking);
        notificationService.createNotification(
                booking.getUser(),
                "Your booking for " + booking.getResource().getName() + " on " + booking.getBookingDate() + " has been rejected. Reason: " + reason,
                Notification.NotificationType.BOOKING_REJECTED,
                savedBooking.getId(),
                "BOOKING"
        );
        return mapToResponseDTO(savedBooking);
    }

    // 5. FIX SUGGESTION LOGIC EDGE CASE
    public List<Map<String, String>> generateSuggestions(List<Booking> existingBookings, BookingRequestDTO request, Resource resource) {
        LocalTime workingStart = resource.getAvailableFrom() != null ? resource.getAvailableFrom() : LocalTime.of(8, 0);
        LocalTime workingEnd = resource.getAvailableTo() != null ? resource.getAvailableTo() : LocalTime.of(18, 0);
        long requestedDuration = Duration.between(request.getStartTime(), request.getEndTime()).toMinutes();

        if (requestedDuration <= 0) requestedDuration = 60; // Fallback

        List<Booking> sortedBookings = existingBookings.stream()
                .sorted(Comparator.comparing(Booking::getStartTime))
                .collect(Collectors.toList());

        List<Map<String, String>> suggestions = new ArrayList<>();
        LocalTime currentStart = workingStart;
        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("HH:mm:ss");

        for (Booking booking : sortedBookings) {
            // Fill gaps between currentStart and next booking
            while (currentStart.plusMinutes(requestedDuration).isBefore(booking.getStartTime()) || 
                   currentStart.plusMinutes(requestedDuration).equals(booking.getStartTime())) {
                suggestions.add(Map.of(
                    "startTime", currentStart.format(formatter),
                    "endTime", currentStart.plusMinutes(requestedDuration).format(formatter)
                ));
                currentStart = currentStart.plusMinutes(requestedDuration);
                if (suggestions.size() >= 5) break; // Limit suggestions
            }
            if (booking.getEndTime().isAfter(currentStart)) {
                currentStart = booking.getEndTime();
            }
            if (suggestions.size() >= 5) break;
        }

        // Fill gap after last booking until workingEnd
        while (currentStart.plusMinutes(requestedDuration).isBefore(workingEnd) || 
               currentStart.plusMinutes(requestedDuration).equals(workingEnd)) {
            if (suggestions.size() >= 5) break;
            suggestions.add(Map.of(
                "startTime", currentStart.format(formatter),
                "endTime", currentStart.plusMinutes(requestedDuration).format(formatter)
            ));
            currentStart = currentStart.plusMinutes(requestedDuration);
        }

        return suggestions;
    }

    // 3. ADD USER EXTRACTION FROM JWT
    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    public Map<String, Object> getBookingTimeline(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
        
        return Map.of(
            "createdAt", booking.getCreatedAt() != null ? booking.getCreatedAt() : "",
            "approvedAt", booking.getApprovedAt() != null ? booking.getApprovedAt() : "",
            "rejectedAt", booking.getRejectedAt() != null ? booking.getRejectedAt() : "",
            "cancelledAt", booking.getCancelledAt() != null ? booking.getCancelledAt() : "",
            "status", booking.getStatus(),
            "cancellationReason", booking.getCancellationReason() != null ? booking.getCancellationReason() : "",
            "cancelledBy", booking.getCancelledBy() != null ? booking.getCancelledBy() : ""
        );
    }



    private BookingResponseDTO mapToResponseDTO(Booking booking) {
        return BookingResponseDTO.builder()
                .id(booking.getId())
                .userId(booking.getUser().getId())
                .userEmail(booking.getUser().getEmail())
                .userName(booking.getUser().getName())
                .resourceId(booking.getResource().getId())
                .resourceName(booking.getResource().getName())
                .bookingDate(booking.getBookingDate())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .purpose(booking.getPurpose())
                .status(booking.getStatus())
                .rejectionReason(booking.getRejectionReason())
                .rejectedReason(booking.getRejectedReason())
                .cancellationReason(booking.getCancellationReason())
                .cancelledBy(booking.getCancelledBy())
                .role(booking.getUser().getRole().name().equals("ADMIN") ? "admin" : "student")
                .userRole(booking.getUser().getRole().name().equals("USER") ? "STUDENT" : booking.getUser().getRole().name())
                .isAdminBooking(booking.getIsAdminBooking())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
