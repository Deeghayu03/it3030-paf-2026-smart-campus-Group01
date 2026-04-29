package com.authcore.unifolio.repo;

import com.authcore.unifolio.entity.Booking;
import com.authcore.unifolio.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    long countByStatus(Booking.BookingStatus status);
    List<Booking> findByUserId(Long userId);
    List<Booking> findByUser(User user);
    List<Booking> findByResourceIdAndBookingDateAndStatusIn(Long resourceId, LocalDate bookingDate, List<Booking.BookingStatus> statuses);
    boolean existsByResourceId(Long resourceId);

    @Query("""
        SELECT b.resource.name, COUNT(b)
        FROM Booking b
        WHERE b.status = com.authcore.unifolio.entity.Booking.BookingStatus.APPROVED
        GROUP BY b.resource.name
        ORDER BY COUNT(b) DESC
    """)
    List<Object[]> findTopResources();

    @Query("""
        SELECT FUNCTION('HOUR', b.startTime), COUNT(b)
        FROM Booking b
        WHERE b.status = com.authcore.unifolio.entity.Booking.BookingStatus.APPROVED
        GROUP BY FUNCTION('HOUR', b.startTime)
        ORDER BY COUNT(b) DESC
    """)
    List<Object[]> findPeakBookingHours();
}

