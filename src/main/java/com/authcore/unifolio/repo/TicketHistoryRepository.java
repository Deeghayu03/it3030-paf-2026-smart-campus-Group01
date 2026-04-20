package com.authcore.unifolio.repo;

import com.authcore.unifolio.entity.TicketHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketHistoryRepository extends JpaRepository<TicketHistory, Long> {
    List<TicketHistory> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
}
