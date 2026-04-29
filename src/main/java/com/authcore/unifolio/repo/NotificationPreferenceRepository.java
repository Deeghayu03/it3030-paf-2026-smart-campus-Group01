package com.authcore.unifolio.repo;

import com.authcore.unifolio.entity.NotificationPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, Long> {
    List<NotificationPreference> findByUser_Email(String email);
    Optional<NotificationPreference> findByUser_EmailAndCategory(String email, String category);
}