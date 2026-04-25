/*
 * ============================================
 * JWT AUTHENTICATION FILTER FLOW:
 * 1. Request intercepted by Filter
 * 2. Extract Authorization header
 * 3. Validate "Bearer " prefix
 * 4. Extract token and parse username (email)
 * 5. Check if user is already authenticated in SecurityContext
 * 6. Load user from database
 * 7. Validate token expiration and signature
 * 8. Set SecurityContext if valid
 * 9. Continue filter chain
 * ============================================
 */

package com.authcore.unifolio.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * FLOW: Request → JwtAuthenticationFilter → JwtUtil → SecurityContext → Controller
 *
 * This filter intercepts incoming HTTP requests to validate JWT tokens
 * and establish the security context for authorized users.
 */
@Component
public class JwtAuthenticationFilter 
        extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    /**
     * FLOW: Extracts JWT → Validates → Authenticates in Spring Security Context
     *
     * @param request HttpServletRequest
     * @param response HttpServletResponse
     * @param filterChain FilterChain
     */
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        // 1. Identify the Authorization header in the request
        final String authHeader = 
            request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        // Skip filter if header is missing or doesn't start with "Bearer "
        if (authHeader == null || 
                !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Extract the raw token (length of "Bearer " is 7)
        jwt = authHeader.substring(7);
        
        try {
            // Extract identity from token
            userEmail = jwtUtil.extractUsername(jwt);
            
            // Only proceed if user is identified and not already authenticated in this request
            if (userEmail != null && 
                    SecurityContextHolder.getContext()
                    .getAuthentication() == null) {
                
                // Load fresh user data from DB
                UserDetails userDetails = 
                    userDetailsService.loadUserByUsername(userEmail);
                
                // Verify token integrity and expiry against the user details
                if (jwtUtil.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                        );
                    
                    // Attach request details to the authentication token
                    authToken.setDetails(
                        new WebAuthenticationDetailsSource()
                            .buildDetails(request)
                    );
                    
                    // Officially authenticate the user for the lifetime of this request
                    SecurityContextHolder.getContext()
                        .setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // Log security failures but let the request proceed (it will be caught by SecurityConfig later)
            System.out.println("JWT Filter error: " + e.getMessage());
        }
        
        // Hand off to the next filter in the chain
        filterChain.doFilter(request, response);
    }
}

