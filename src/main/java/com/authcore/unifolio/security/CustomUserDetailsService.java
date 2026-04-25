/*
 * ============================================
 * USER DETAILS SERVICE FLOW:
 * 1. Called by Spring Security AuthenticationManager or JwtAuthenticationFilter
 * 2. Receives username (email)
 * 3. Queries UserRepository.findByEmail()
 * 4. Checks if user exists
 * 5. Returns the domain User object (which implements UserDetails)
 * ============================================
 */

package com.authcore.unifolio.security;

import com.authcore.unifolio.entity.User;
import com.authcore.unifolio.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * FLOW: Username → UserRepository → UserDetails
 *
 * This class serves as the bridge between the database-driven user storage 
 * and Spring Security's authentication mechanisms.
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    /**
     * FLOW: Database Query → Validation → UserDetails Object
     *
     * @param email The identifier for the user
     * @return UserDetails implementation for the found user
     * @throws UsernameNotFoundException if email doesn't exist in DB
     */
    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {
        // Find user by email, or throw exception if not found
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException(
                "User not found with email: " + email));
    }
}

