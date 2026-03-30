package com.authcore.unifolio.repo;

import com.authcore.unifolio.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByOauthProviderId(String oauthProviderId);
    Boolean existsByEmail(String email);
}