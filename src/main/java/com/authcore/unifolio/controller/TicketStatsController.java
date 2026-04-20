package com.authcore.unifolio.controller;

import com.authcore.unifolio.dto.TicketStatsResponse;
import com.authcore.unifolio.service.TicketStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Exposes aggregated ticket statistics for the analytics dashboard.
 *
 * Endpoint: GET /api/tickets/stats
 *
 * NOTE: Spring resolves literal paths (/stats) before path-variable patterns (/{id}),
 * so this endpoint will correctly match before TicketController's GET /api/tickets/{id}.
 */
@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
@RequiredArgsConstructor
public class TicketStatsController {

    private final TicketStatsService ticketStatsService;

    /**
     * Returns all aggregated stats for the analytics dashboard.
     *
     * GET /api/tickets/stats
     * Response: 200 OK with TicketStatsResponse body
     */
    @GetMapping("/stats")
    public ResponseEntity<TicketStatsResponse> getStats() {
        return ResponseEntity.ok(ticketStatsService.getStats());
    }
}
