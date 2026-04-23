package com.authcore.unifolio.controller;

import com.authcore.unifolio.dto.BookingRequestDTO;
import com.authcore.unifolio.dto.BookingResponseDTO;
import com.authcore.unifolio.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class BookingController {

    private final BookingService bookingService;

    // ✅ STUDENT: Create booking
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody BookingRequestDTO request) {
        return ResponseEntity.ok(Map.of(
            "message", "Booking created successfully",
            "data", bookingService.createBooking(request)
        ));
    }

    // ✅ STUDENT: Edit booking (only if PENDING)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBooking(@PathVariable Long id, @RequestBody BookingRequestDTO request) {
        return ResponseEntity.ok(Map.of(
            "message", "Booking updated successfully",
            "data", bookingService.updateBooking(id, request)
        ));
    }

    // ✅ STUDENT: Get my bookings
    @GetMapping("/my")
    public ResponseEntity<?> getMyBookings() {
        return ResponseEntity.ok(bookingService.getMyBookings());
    }

    // ❗ ADMIN: Get ALL bookings
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    // ❗ ADMIN: Approve
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approve(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of(
            "message", "Booking approved successfully",
            "data", bookingService.approveBooking(id)
        ));
    }

    // ❗ ADMIN: Reject
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> reject(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.get("reason") : null;
        return ResponseEntity.ok(Map.of(
            "message", "Booking rejected",
            "data", bookingService.rejectBooking(id, reason)
        ));
    }

    // ✅ USER: Cancel own booking
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancel(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.get("reason") : null;
        return ResponseEntity.ok(Map.of(
            "message", "Booking cancelled successfully",
            "data", bookingService.cancelBooking(id, reason)
        ));
    }
    // ✅ USER: Delete own booking (Permanent)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.ok(Map.of(
            "message", "Booking deleted permanently"
        ));
    }
}
