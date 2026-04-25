/*
 * ============================================
 * SECURITY CONFIGURATION FLOW:
 * 1. Definitive CSRF & CORS policies
 * 2. Path-based authorization rules (Who can access what?)
 * 3. Exception handling for unauthorized API vs Web requests
 * 4. OAuth2 login integration with success/failure handlers
 * 5. Stateless Session management (with specific considerations for OAuth flow)
 * 6. Injection of custom JWT filter into the default process
 * ============================================
 */

package com.authcore.unifolio.config;

import com.authcore.unifolio.security.CustomUserDetailsService;
import com.authcore.unifolio.security.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * FLOW: Incoming Request → FilterChain → AuthenticationManager → SecurityContext
 *
 * This configuration class defines the global security landscape of the application,
 * setting rules for authentication, authorization, and cross-origin interactions.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private JwtAuthenticationFilter jwtAuthFilter;

    @Autowired
    private com.authcore.unifolio.security.OAuth2SuccessHandler oAuth2SuccessHandler;

    /**
     * FLOW: Builds Security Filter Chain with explicit access rules and handlers.
     *
     * @param http HttpSecurity configuration object
     * @return Fully configured SecurityFilterChain
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. Disable CSRF as authentication is handled via JWT headers
            .csrf(csrf -> csrf.disable())
            // 2. Enable CORS with dedicated configuration bean
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // 3. Define Endpoint-level Authorization
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/auth/**",
                    "/api/public/**",
                    "/login/oauth2/**",
                    "/oauth2/**",
                    "/login/**"
                ).permitAll() // Publicly accessible endpoints
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/technician/**").hasAnyRole("ADMIN", "TECHNICIAN")
                .requestMatchers("/api/bookings/my").authenticated()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/bookings").hasRole("ADMIN")
                .requestMatchers("/api/bookings/**").authenticated()
                .requestMatchers("/api/resources", "/api/resources/**").authenticated()
                .anyRequest().authenticated() // All other requests require a valid JWT
            )
            // 4. Custom Error Responses for Auth failures
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, authException) -> {
                    String requestUri = request.getRequestURI();
                    if (requestUri.startsWith("/api/")) {
                        // Return JSON error for REST API calls
                        response.setContentType("application/json");
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        response.getWriter().write("{\"error\": \"Unauthorized\", \"message\": \""
                            + authException.getMessage() + "\"}");
                    } else {
                        // Redirect to login for traditional browser requests
                        response.sendRedirect("/oauth2/authorization/google");
                    }
                })
            )
            // 5. Session Policy: IF_REQUIRED allows OAuth state persistence during the redirect flow
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
            )
            // 6. External Identity Provider integration
            .oauth2Login(oauth2 -> oauth2
                .successHandler(oAuth2SuccessHandler)
                .failureHandler((request, response, exception) -> {
                    System.out.println("OAuth2 FAILURE: " + exception.getMessage());
                    exception.printStackTrace();
                    response.sendRedirect("http://localhost:5173/login?error=oauth2_failed");
                })
            )
            .formLogin(form -> form.disable()) // Disable default Spring login form
            // 7. Inject our JWT processor before the standard Password filter
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
            
        return http.build();
    }

    /**
     * Configures the standard local authentication provider using BCrypt and JDBC-backed user service.
     */
    @Bean
    public AuthenticationManager authenticationManager() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return new ProviderManager(provider);
    }

    /**
     * Defines the hashing algorithm used for all passwords in the system.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Defines Cross-Origin Resource Sharing (CORS) rules for React and Vite servers.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Allow listed development origins
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:5173",
            "http://localhost:5174"
        ));
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "PATCH",
            "DELETE", "OPTIONS"
        ));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}

