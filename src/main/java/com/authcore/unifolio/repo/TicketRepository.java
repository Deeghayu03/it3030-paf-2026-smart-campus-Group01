package com.authcore.unifolio.repo;

import com.authcore.unifolio.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByReportedByEmailOrderByCreatedAtDesc(String email);
    List<Ticket> findByStatus(Ticket.TicketStatus status);
}
