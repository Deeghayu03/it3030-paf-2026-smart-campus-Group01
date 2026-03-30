package com.authcore.unifolio.repo;

import com.authcore.unifolio.entity.Notification;
import com.authcore.unifolio.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    List<Notification> findByUserEmailAndIsRead(String email, boolean isRead);
    long countByUserEmailAndIsRead(String email, boolean isRead);
    List<Notification> findByUserId(Long userId);
}
