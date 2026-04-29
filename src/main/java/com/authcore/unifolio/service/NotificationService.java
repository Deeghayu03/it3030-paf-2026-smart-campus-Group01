/*
 * ============================================
 * NOTIFICATION SERVICE FLOW:
 * 1. createNotification() called by other services (Ticket, Booking)
 * 2. Checks user preferences for the given category
 * 3. Persists Notification to database
 * 4. Provides methods to retrieve, read, and delete notifications
 * ============================================
 */

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

/**
 * FLOW: Action → NotificationService → NotificationRepository → Database
 *
 * This service handles the creation and lifecycle management of in-app 
 * notifications, respecting user-defined notification preferences.
 */
@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationPreferenceRepository preferenceRepository;

    /**
     * FLOW: Checks Preference → Creates Entity → Saves to Repository
     *
     * @param user Recipient user
     * @param message Display message
     * @param type Notification category enum
     * @param referenceId ID of the linked entity (Ticket/Booking)
     * @param referenceType Type of the linked entity
     */
    public void createNotification(User user, String message,
            Notification.NotificationType type,
            Long referenceId, String referenceType) {
        
        // 1. Determine the category based on the notification type
        String category = type.name().startsWith("BOOKING") ? "BOOKING" : "TICKET";
        
        // 2. Suppress notification if the user has disabled this category
        Optional<NotificationPreference> pref = preferenceRepository.findByUser_EmailAndCategory(user.getEmail(), category);
        if (pref.isPresent() && !pref.get().getEnabled()) {
            return;
        }

        // 3. Construct and persist the notification entity
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setType(type);
        notification.setReferenceId(referenceId);
        notification.setReferenceType(referenceType);
        notification.setIsRead(false);
        notificationRepository.save(notification);
    }

    /**
     * Retrieves all notifications for a specific user, sorted by most recent.
     */
    @Transactional(readOnly = true)
    public List<Notification> getMyNotifications(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            return List.of();
        }
        return notificationRepository.findByUserOrderByCreatedAtDesc(userOptional.get());
    }

    /**
     * Counts how many unread notifications a user has.
     */
    @Transactional(readOnly = true)
    public long getUnreadCount(String email) {
        return notificationRepository
            .countByUser_EmailAndIsRead(email, Boolean.FALSE);
    }

    /**
     * Sets the isRead flag to true for a single notification.
     */
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId)
            .ifPresent(n -> {
                n.setIsRead(true);
                notificationRepository.save(n);
            });
    }

    /**
     * Batch update all unread notifications for a user as read.
     */
    public void markAllAsRead(String email) {
        List<Notification> notifications =
            notificationRepository
                .findByUser_EmailAndIsRead(email, Boolean.FALSE);
        notifications.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(notifications);
    }

    /**
     * Deletes a specific notification if it belongs to the requesting user.
     */
    public void deleteNotification(Long notificationId, String email) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (n.getUser().getEmail().equals(email)) {
                notificationRepository.delete(n);
            }
        });
    }

    /**
     * Batch deletion of all notifications that have been read.
     */
    @Transactional
    public void clearReadNotifications(String email) {
        notificationRepository.deleteByUser_EmailAndIsRead(email, Boolean.TRUE);
    }

    /**
     * FLOW: Fetch From DB → Initialize Defaults if Missing → Return List
     * 
     * Ensures every user has a preference record for both BOOKING and TICKET categories.
     */
    public List<NotificationPreference> getPreferences(String email) {
        List<NotificationPreference> prefs = preferenceRepository.findByUser_Email(email);
        if (prefs.isEmpty()) {
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Initialization of default preferences (All Enabled)
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

    /**
     * Toggles a user's preference for a specific notification category.
     */
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

