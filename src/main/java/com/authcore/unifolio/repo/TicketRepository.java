package com.authcore.unifolio.repo;

import com.authcore.unifolio.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByReportedByEmailOrderByCreatedAtDesc(String email);
    List<Ticket> findByStatus(Ticket.TicketStatus status);

    /**
     * Returns tickets whose SLA deadline has passed but have not yet been
     * flagged as breached, and are still in an active (non-terminal) state.
     */
    @Query("SELECT t FROM Ticket t WHERE t.slaBreached = false " +
           "AND t.slaDeadline < :now " +
           "AND t.status NOT IN (com.authcore.unifolio.entity.Ticket.TicketStatus.RESOLVED, " +
           "com.authcore.unifolio.entity.Ticket.TicketStatus.CLOSED, " +
           "com.authcore.unifolio.entity.Ticket.TicketStatus.REJECTED)")
    List<Ticket> findUnmarkedSlaBreaches(@Param("now") LocalDateTime now);

    // ── Count helpers used by SlaScheduler & TicketStatsService ──────────────
    long countByStatus(Ticket.TicketStatus status);
    long countBySlaBreachedTrue();
    long countByPriority(Ticket.TicketPriority priority);
    long countByCategory(Ticket.TicketCategory category);

    /**
     * Returns ticket counts grouped by creation date for the last N days.
     * Row format: [date-string, count]
     */
    @Query("SELECT DATE(t.createdAt) as day, COUNT(t) " +
           "FROM Ticket t " +
           "WHERE t.createdAt >= :since " +
           "GROUP BY DATE(t.createdAt) " +
           "ORDER BY day ASC")
    List<Object[]> countTicketsPerDay(@Param("since") LocalDateTime since);

    /**
     * Average hours between createdAt and updatedAt for RESOLVED/CLOSED tickets.
     * Returns null if no resolved tickets exist.
     */
    @Query("SELECT AVG(TIMESTAMPDIFF(HOUR, t.createdAt, t.updatedAt)) " +
           "FROM Ticket t " +
           "WHERE t.status IN (com.authcore.unifolio.entity.Ticket.TicketStatus.RESOLVED, " +
           "com.authcore.unifolio.entity.Ticket.TicketStatus.CLOSED)")
    Double findAverageResolutionHours();
}


