package com.authcore.unifolio.service;

import com.authcore.unifolio.entity.Notification;
import com.authcore.unifolio.entity.User;
import com.authcore.unifolio.repo.NotificationRepository;
import com.authcore.unifolio.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    public void createNotification(User user, String message,
            Notification.NotificationType type, 
            Long referenceId, String referenceType) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setType(type);
        notification.setReferenceId(referenceId);
        notification.setReferenceType(referenceType);
        notification.setIsRead(false);
        notificationRepository.save(notification);
    }

    public List<Notification> getMyNotifications(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository
            .findByUserOrderByCreatedAtDesc(user);
    }

    public long getUnreadCount(String email) {
        return notificationRepository
            .countByUserEmailAndIsRead(email, Boolean.FALSE);
    }

    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId)
            .ifPresent(n -> {
                n.setIsRead(true);
                notificationRepository.save(n);
            });
    }

    public void markAllAsRead(String email) {
        List<Notification> notifications =
            notificationRepository
                .findByUserEmailAndIsRead(email, Boolean.FALSE);
        notifications.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(notifications);
    }
}
