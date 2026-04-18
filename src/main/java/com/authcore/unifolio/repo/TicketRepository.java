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

    long countByStatus(Ticket.TicketStatus status);

    long countBySlaBreachedTrue();
}

