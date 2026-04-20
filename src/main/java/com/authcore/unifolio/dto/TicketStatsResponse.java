package com.authcore.unifolio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Response DTO for GET /api/tickets/stats
 * Contains all aggregated data needed by the analytics dashboard.
 *
 * Sections:
 *  - overview:           top-level counts (total, open, inProgress, resolved, slaBreached)
 *  - byStatus:           count per status (for the donut chart)
 *  - byPriority:         count per priority (for the bar chart)
 *  - byCategory:         count per category (for the horizontal bar chart)
 *  - trend:              tickets created per day for last 30 days (for the line chart)
 *  - avgResolutionHours: average time to resolve in hours
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketStatsResponse {

    private Overview          overview;
    private Map<String, Long> byStatus;
    private Map<String, Long> byPriority;
    private Map<String, Long> byCategory;
    private List<DailyCount>  trend;
    private Double            avgResolutionHours;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Overview {
        private long total;
        private long open;
        private long inProgress;
        private long resolved;
        private long closed;
        private long rejected;
        private long slaBreached;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyCount {
        private String date;   // "2024-01-15"
        private long   count;
    }
}
