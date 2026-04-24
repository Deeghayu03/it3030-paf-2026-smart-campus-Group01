package com.authcore.unifolio.service;

import com.authcore.unifolio.entity.Notification;
import com.authcore.unifolio.entity.NotificationPreference;
import com.authcore.unifolio.entity.User;
import com.authcore.unifolio.repo.NotificationPreferenceRepository;
import com.authcore.unifolio.repo.NotificationRepository;
import com.authcore.unifolio.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationPreferenceRepository preferenceRepository;

    public void createNotification(User user, String message,
            Notification.NotificationType type,
            Long referenceId, String referenceType) {
        String category = type.name().startsWith("BOOKING") ? "BOOKING" : "TICKET";
        Optional<NotificationPreference> pref = preferenceRepository.findByUser_EmailAndCategory(user.getEmail(), category);
        if (pref.isPresent() && !pref.get().getEnabled()) {
            return;
        }

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setType(type);
        notification.setReferenceId(referenceId);
        notification.setReferenceType(referenceType);
        notification.setIsRead(false);
        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<Notification> getMyNotifications(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            return List.of();
        }
        return notificationRepository.findByUserOrderByCreatedAtDesc(userOptional.get());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String email) {
        return notificationRepository
            .countByUser_EmailAndIsRead(email, Boolean.FALSE);
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
                .findByUser_EmailAndIsRead(email, Boolean.FALSE);
        notifications.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(notifications);
    }

    public void deleteNotification(Long notificationId, String email) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (n.getUser().getEmail().equals(email)) {
                notificationRepository.delete(n);
            }
        });
    }

    @Transactional
    public void clearReadNotifications(String email) {
        notificationRepository.deleteByUser_EmailAndIsRead(email, Boolean.TRUE);
    }

    public List<NotificationPreference> getPreferences(String email) {
        List<NotificationPreference> prefs = preferenceRepository.findByUser_Email(email);
        if (prefs.isEmpty()) {
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
            NotificationPreference bookingPref = new NotificationPreference();
            bookingPref.setUser(user);
            bookingPref.setCategory("BOOKING");
            bookingPref.setEnabled(true);
            preferenceRepository.save(bookingPref);

            NotificationPreference ticketPref = new NotificationPreference();
            ticketPref.setUser(user);
            ticketPref.setCategory("TICKET");
            ticketPref.setEnabled(true);
            preferenceRepository.save(ticketPref);

            prefs = preferenceRepository.findByUser_Email(email);
        }
        return prefs;
    }

    public NotificationPreference togglePreference(String email, String category) {
        Optional<NotificationPreference> existing = preferenceRepository.findByUser_EmailAndCategory(email, category);
        if (existing.isPresent()) {
            NotificationPreference pref = existing.get();
            pref.setEnabled(!pref.getEnabled());
            return preferenceRepository.save(pref);
        } else {
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
            NotificationPreference pref = new NotificationPreference();
            pref.setUser(user);
            pref.setCategory(category);
            pref.setEnabled(false);
            return preferenceRepository.save(pref);
        }
    }
}
