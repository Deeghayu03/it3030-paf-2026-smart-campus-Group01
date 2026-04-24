package com.authcore.unifolio.service;

import com.authcore.unifolio.entity.Notification;
import com.authcore.unifolio.entity.User;
import com.authcore.unifolio.repo.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public void createNotification(User user, String message,
            Notification.NotificationType type, 
            Long referenceId, String referenceType) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setType(type);
        notification.setReferenceId(referenceId);
        notification.setReferenceType(referenceType);
        notification.setRead(false);
        notificationRepository.save(notification);
    }

    public List<Notification> getMyNotifications(String email) {
        User user = new User();
        user.setEmail(email);
        return notificationRepository
            .findByUserOrderByCreatedAtDesc(user);
    }

    public long getUnreadCount(String email) {
        return notificationRepository
            .countByUserEmailAndIsRead(email, false);
    }

    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId)
            .ifPresent(n -> {
                n.setRead(true);
                notificationRepository.save(n);
            });
    }

    public void markAllAsRead(String email) {
        List<Notification> notifications = 
            notificationRepository
                .findByUserEmailAndIsRead(email, false);
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
    }
}
