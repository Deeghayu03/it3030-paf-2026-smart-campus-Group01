package com.authcore.unifolio.scheduler;

import com.authcore.unifolio.entity.Ticket;
import com.authcore.unifolio.repo.TicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Background job that monitors SLA deadlines for all open tickets.
 *
 * Runs every 15 minutes and marks any ticket as slaBreached = true
 * if its slaDeadline has passed and it is still not RESOLVED/CLOSED/REJECTED.
 *
 * This drives:
 *  - The red "SLA Breached" badge on the frontend ticket detail page
 *  - The SLA breach count on the analytics dashboard
 *  - The pulse animation on the SLA timer component
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SlaScheduler {

    private final TicketRepository ticketRepository;

    /**
     * Runs every 15 minutes.
     * Scans for tickets whose SLA deadline has passed but are not yet
     * marked as breached, and updates them in a single batch transaction.
     *
     * fixedRate = 15 * 60 * 1000 ms = 900_000 ms
     * initialDelay = 60_000 ms — waits 1 minute after app startup
     * before the first run, so the app finishes initializing first.
     */
    @Scheduled(fixedRate = 900_000, initialDelay = 60_000)
    @Transactional
    public void checkSlaBreaches() {
        LocalDateTime now = LocalDateTime.now();
        log.info("[SlaScheduler] Running SLA breach check at {}", now);

        List<Ticket> overdueTickets = ticketRepository.findUnmarkedSlaBreaches(now);

        if (overdueTickets.isEmpty()) {
            log.info("[SlaScheduler] No new SLA breaches found.");
            return;
        }

        log.warn("[SlaScheduler] Found {} ticket(s) with SLA breaches — marking now.", overdueTickets.size());

        for (Ticket ticket : overdueTickets) {
            ticket.setSlaBreached(true);
            log.warn(
                "[SlaScheduler] Ticket #{} (priority={}, deadline={}) marked as SLA breached.",
                ticket.getId(),
                ticket.getPriority(),
                ticket.getSlaDeadline()
            );
        }

        // All tickets are already managed JPA entities — changes are
        // flushed automatically at the end of the @Transactional method.
        // No explicit save call needed.

        log.info("[SlaScheduler] SLA breach check complete. {} ticket(s) updated.", overdueTickets.size());
    }

    /**
     * Runs once every day at midnight.
     * Logs a summary of current ticket health for operational visibility.
     * This is purely informational — no data is modified.
     *
     * cron = "0 0 0 * * *" means: second=0, minute=0, hour=0, every day.
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void dailyHealthSummary() {
        long openCount       = ticketRepository.countByStatus(Ticket.TicketStatus.OPEN);
        long inProgressCount = ticketRepository.countByStatus(Ticket.TicketStatus.IN_PROGRESS);
        long breachedCount   = ticketRepository.countBySlaBreachedTrue();

        log.info(
            "[SlaScheduler] Daily summary — Open: {}, In Progress: {}, SLA Breached: {}",
            openCount, inProgressCount, breachedCount
        );
    }
}
