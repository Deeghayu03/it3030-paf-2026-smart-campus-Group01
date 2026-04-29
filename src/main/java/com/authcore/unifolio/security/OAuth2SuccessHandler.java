/*
 * ============================================
 * OAUTH2 SUCCESS FLOW:
 * 1. User successfully authenticates with Google
 * 2. Spring Security calls OAuth2SuccessHandler
 * 3. Extract email and attributes from OAuth2User
 * 4. Check if user exists in local database
 * 5. Create new user if first-time social login
 * 6. Generate local JWT for the user
 * 7. Determine if user needs to complete profile
 * 8. Redirect to frontend with token and status as URL params
 * ============================================
 */

package com.authcore.unifolio.security;

import com.authcore.unifolio.entity.User;
import com.authcore.unifolio.repo.StudentRepository;
import com.authcore.unifolio.repo.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * FLOW: OAuth2User → Database Sync → JwtUtil → Frontend Redirect
 *
 * This handler processes successful third-party logins, bridging OAuth2 
 * identities with our internal JWT-based authentication system.
 */
@Component
public class OAuth2SuccessHandler
        implements AuthenticationSuccessHandler {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    /**
     * FLOW: Extracts Attributes → Local User Management → JWT Generation → URL Redirect
     *
     * @param request HttpServletRequest
     * @param response HttpServletResponse
     * @param authentication Contains the authenticated OAuth2 principal
     */
    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication)
            throws IOException, ServletException {

        // Extract the Google user profile information
        OAuth2User oAuth2User =
            (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String googleId = oAuth2User.getAttribute("sub");

        // Sync with local database: Create user record if it doesn't exist
        User user = userRepository.findByEmail(email)
            .orElseGet(() -> {
                User newUser = new User();
                newUser.setEmail(email);
                newUser.setPassword(null); // OAuth users don't have a local password
                newUser.setRole(User.Role.USER);
                newUser.setOauthProvider("google");
                newUser.setOauthProviderId(googleId);
                return userRepository.save(newUser);
            });

        // Load fresh UserDetails to generate a standard JWT for this session
        UserDetails userDetails =
            userDetailsService.loadUserByUsername(email);
        String token = jwtUtil.generateToken(userDetails);

        String role = user.getRole().name();
        
        // Determine if the user has already filled in student-specific metadata
        boolean isNewUser = !studentRepository.existsByUserId(user.getId());

        // Construct the redirect URL with tokens and user info as query parameters
        String redirectUrl =
            "http://localhost:5173/oauth2/callback" +
            "?token=" + token +
            "&role=" + role +
            "&email=" + java.net.URLEncoder.encode(email, "UTF-8") +
            "&name=" + java.net.URLEncoder.encode(name != null ? name : "", "UTF-8") +
            "&newUser=" + isNewUser;

        // Force a browser redirect to the React frontend
        response.sendRedirect(redirectUrl);
    }
}

