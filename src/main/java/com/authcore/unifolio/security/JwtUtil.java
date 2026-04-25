/*
 * ============================================
 * JWT GENERATION FLOW:
 * 1. userDetails retrieved after successful login
 * 2. JwtUtil.generateToken(userDetails) called
 * 3. Claims (role, subject) added to payload
 * 4. Token signed with HS256 using secret key
 * 5. String token returned to client
 * ============================================
 */

package com.authcore.unifolio.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * FLOW: userDetails → JwtUtil → Signed JWT String
 *
 * This utility class manages the lifecycle of JSON Web Tokens,
 * including generation, cryptographic signing, and claim extraction.
 */
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    /**
     * Converts the configured secret string into a HMAC signing key.
     * 
     * @return cryptographical Key
     */
    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(
            Base64.getEncoder().encodeToString(secret.getBytes())
        );
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * FLOW: Maps claims → Sets Subject → Signs with Key → Compacts to String
     *
     * @param userDetails Spring Security user information
     * @return Signed JWT string
     */
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        // Inject user roles into the JWT payload for easy frontend/filter access
        claims.put("role", userDetails.getAuthorities()
            .iterator().next().getAuthority());
            
        return Jwts.builder()
            .setClaims(claims)
            .setSubject(userDetails.getUsername())
            .setIssuedAt(new Date(System.currentTimeMillis()))
            .setExpiration(new Date(System.currentTimeMillis() + expiration))
            .signWith(getSigningKey(), SignatureAlgorithm.HS256)
            .compact();
    }

    /**
     * Extracts the user email (subject) from the token.
     * 
     * @param token JWT string
     * @return Username/Email string
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extracts the custom "role" claim from the token.
     * 
     * @param token JWT string
     * @return Role authority string
     */
    public String extractRole(String token) {
        return extractClaim(token, claims -> 
            claims.get("role", String.class));
    }

    /**
     * Generic method to extract any data claim from the JWT.
     * 
     * @param token JWT string
     * @param claimsResolver functional reference to a specific claim getter
     * @return The requested claim data
     */
    public <T> T extractClaim(String token, 
            Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Parses and validates the JWT against the local signing key.
     * 
     * @param token JWT string
     * @return All claims found in the token payload
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token)
            .getBody();
    }

    /**
     * Validates if the token belongs to the user and is not expired.
     * 
     * @param token JWT string
     * @param userDetails Comparison user data
     * @return boolean validation result
     */
    public Boolean isTokenValid(String token, 
            UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) 
            && !isTokenExpired(token));
    }

    /**
     * Logic check to see if token expiration date has passed.
     * 
     * @param token JWT string
     * @return true if expired
     */
    private Boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration)
            .before(new Date());
    }
}

