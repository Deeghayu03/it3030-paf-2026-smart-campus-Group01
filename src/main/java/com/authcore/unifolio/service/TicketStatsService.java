package com.authcore.unifolio.service;

import com.authcore.unifolio.dto.TicketStatsResponse;
import com.authcore.unifolio.dto.TicketStatsResponse.DailyCount;
import com.authcore.unifolio.dto.TicketStatsResponse.Overview;
import com.authcore.unifolio.entity.Ticket;
import com.authcore.unifolio.repo.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Builds the aggregated statistics payload for the analytics dashboard.
 * All queries are read-only — annotated with readOnly = true for performance.
 *
 * Exposed via: GET /api/tickets/stats  (Admin only)
 */
@Service
@RequiredArgsConstructor
public class TicketStatsService {

    private final TicketRepository ticketRepository;

    @Transactional(readOnly = true)
    public TicketStatsResponse getStats() {

        // ── Overview counts ───────────────────────────────────────────────
        Overview overview = Overview.builder()
            .total(      ticketRepository.count())
            .open(       ticketRepository.countByStatus(Ticket.TicketStatus.OPEN))
            .inProgress( ticketRepository.countByStatus(Ticket.TicketStatus.IN_PROGRESS))
            .resolved(   ticketRepository.countByStatus(Ticket.TicketStatus.RESOLVED))
            .closed(     ticketRepository.countByStatus(Ticket.TicketStatus.CLOSED))
            .rejected(   ticketRepository.countByStatus(Ticket.TicketStatus.REJECTED))
            .slaBreached(ticketRepository.countBySlaBreachedTrue())
            .build();

        // ── By status ─────────────────────────────────────────────────────
        Map<String, Long> byStatus = new LinkedHashMap<>();
        for (Ticket.TicketStatus s : Ticket.TicketStatus.values()) {
            byStatus.put(s.name(), ticketRepository.countByStatus(s));
        }

        // ── By priority ───────────────────────────────────────────────────
        Map<String, Long> byPriority = new LinkedHashMap<>();
        for (Ticket.TicketPriority p : Ticket.TicketPriority.values()) {
            byPriority.put(p.name(), ticketRepository.countByPriority(p));
        }

        // ── By category ───────────────────────────────────────────────────
        Map<String, Long> byCategory = new LinkedHashMap<>();
        for (Ticket.TicketCategory c : Ticket.TicketCategory.values()) {
            long count = ticketRepository.countByCategory(c);
            if (count > 0) byCategory.put(c.name(), count); // only include non-zero
        }

        // ── 30-day trend ──────────────────────────────────────────────────
        LocalDateTime since = LocalDateTime.now().minusDays(30);
        List<Object[]> rawTrend = ticketRepository.countTicketsPerDay(since);

        List<DailyCount> trend = rawTrend.stream()
            .map(row -> DailyCount.builder()
                .date(row[0].toString())             // DATE string e.g. "2024-01-15"
                .count(((Number) row[1]).longValue())
                .build())
            .toList();

        // ── Avg resolution time ───────────────────────────────────────────
        Double avgHours = ticketRepository.findAverageResolutionHours();

        return TicketStatsResponse.builder()
            .overview(overview)
            .byStatus(byStatus)
            .byPriority(byPriority)
            .byCategory(byCategory)
            .trend(trend)
            .avgResolutionHours(avgHours != null ? Math.round(avgHours * 10.0) / 10.0 : null)
            .build();
    }
}
