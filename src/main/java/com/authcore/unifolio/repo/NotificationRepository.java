package com.authcore.unifolio.repo;

import com.authcore.unifolio.entity.Notification;
import com.authcore.unifolio.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    List<Notification> findByUser_EmailAndIsRead(String email, Boolean isRead);
    long countByUser_EmailAndIsRead(String email, Boolean isRead);
    List<Notification> findByUserId(Long userId);

    @Modifying
    @Transactional
    void deleteByUser_EmailAndIsRead(String email, Boolean isRead);
}
