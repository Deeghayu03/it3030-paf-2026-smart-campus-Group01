/*
 * ============================================
 * USER ENTITY FLOW:
 * 1. Represents the central authentication record
 * 2. Implements Spring Security UserDetails for integration
 * 3. Links to Student profile
 * 4. Stores hashed passwords or OAuth IDs
 * 5. Manages Roles (ADMIN, USER, TECHNICIAN)
 * ============================================
 */

package com.authcore.unifolio.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

/**
 * ENTITY: User
 * ROLE: Core Authentication Identity
 *
 * This entity mapping defines the "users" table and provides the 
 * necessary implementation for Spring Security authentication.
 */
@Data
@Entity
@Table(name = "users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @JsonIgnore // Security: Never expose the password hash in JSON responses
    @Column(nullable = false)
    private String password;

    @Column
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // OAuth2 specific fields
    private String oauthProvider;
    private String oauthProviderId;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Automatic timestamping before initial persistence.
     */
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        // Default role assignment if none specified
        if (role == null) role = Role.USER;
    }

    /**
     * Automatic timestamping before any database update.
     */
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * FLOW: Role Enum → SimpleGrantedAuthority → Spring Security Context
     * 
     * Converts our internal Role enum into a format Spring Security understands.
     * Prefixes with "ROLE_" to follow standard conventions.
     */
    @Override
    @JsonIgnore
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    @JsonIgnore
    public String getUsername() {
        return email;
    }

    @Override
    @JsonIgnore
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    @JsonIgnore
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    @JsonIgnore
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    @JsonIgnore
    public boolean isEnabled() {
        return true;
    }

    /**
     * System roles defining access levels.
     */
    public enum Role {
        USER, ADMIN, TECHNICIAN
    }
}