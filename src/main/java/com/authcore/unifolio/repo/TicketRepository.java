package com.authcore.unifolio.repo;

import com.authcore.unifolio.entity.Ticket;
import com.authcore.unifolio.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByReportedByEmailOrderByCreatedAtDesc(String email);
    List<Ticket> findByAssignedToOrderByCreatedAtDesc(User tech);
    long countByStatus(Ticket.TicketStatus status);
    long countByAssignedTo(User tech);
    long countByAssignedToAndStatus(User tech, Ticket.TicketStatus status);
}
