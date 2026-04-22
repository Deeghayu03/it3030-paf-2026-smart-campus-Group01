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

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication)
            throws IOException, ServletException {

        OAuth2User oAuth2User =
            (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String googleId = oAuth2User.getAttribute("sub");

        User user = userRepository.findByEmail(email)
            .orElseGet(() -> {
                User newUser = new User();
                newUser.setEmail(email);
                newUser.setPassword(null);
                newUser.setRole(User.Role.USER);
                newUser.setOauthProvider("google");
                newUser.setOauthProviderId(googleId);
                return userRepository.save(newUser);
            });

        UserDetails userDetails =
            userDetailsService.loadUserByUsername(email);
        String token = jwtUtil.generateToken(userDetails);

        String role = user.getRole().name();
        boolean isNewUser = !studentRepository.existsByUserId(user.getId());

        String redirectUrl =
            "http://localhost:5173/oauth2/callback" +
            "?token=" + token +
            "&role=" + role +
            "&email=" + java.net.URLEncoder.encode(email, "UTF-8") +
            "&name=" + java.net.URLEncoder.encode(name != null ? name : "", "UTF-8") +
            "&newUser=" + isNewUser;

        response.sendRedirect(redirectUrl);
    }
}
