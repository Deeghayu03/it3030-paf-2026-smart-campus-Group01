package com.authcore.unifolio.repo;

import com.authcore.unifolio.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByOauthProviderId(String oauthProviderId);
    Boolean existsByEmail(String email);
    long countByRole(User.Role role);
    List<User> findByRole(User.Role role);
}