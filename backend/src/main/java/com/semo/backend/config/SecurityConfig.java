package com.semo.backend.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.semo.backend.security.JwtAuthenticationFilter;
import com.semo.backend.util.JwtTokenProvider;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;

    public SecurityConfig(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authz -> authz
                        // Public / unauthenticated
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/users/check-email").permitAll()
                        .requestMatchers("/ws/**").permitAll()
                        .requestMatchers("/swagger-ui/**").permitAll()
                        .requestMatchers("/v3/api-docs/**").permitAll()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/uploads/**").permitAll()
                        .requestMatchers("/api/admin/system/hard-reset").permitAll()
                        .requestMatchers("/api/public/**").permitAll()

                        // System / Admin general endpoints
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // Users
                        // Admin-only endpoints for user management
                        .requestMatchers(HttpMethod.POST, "/api/users/*/reset-password").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/users/*/toggle-status").hasRole("ADMIN")
                        .requestMatchers("/api/users").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/users/*").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/users/*").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/users/by-role").hasRole("ADMIN")

                        // Authenticated user endpoints
                        .requestMatchers(HttpMethod.PUT, "/api/users/change-password").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/users/wallet/deposit").hasAnyRole("CUSTOMER", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/users/by-email").authenticated()

                        // Uploads
                        .requestMatchers("/api/upload/avatar").authenticated()
                        .requestMatchers("/api/upload/scooter/**").hasRole("ADMIN")

                        // Scooters: allow public GETs, admin for create/update
                        .requestMatchers(HttpMethod.GET, "/api/scooters/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/routing/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/scooters").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/scooters/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/scooters/**").hasRole("ADMIN")

                        // Maintenance
                        .requestMatchers(HttpMethod.POST, "/api/maintenance/*/report").authenticated()
                        .requestMatchers("/api/maintenance/**").hasRole("ADMIN")

                        // Rentals
                        .requestMatchers(HttpMethod.PUT, "/api/rentals/force-end-all").hasRole("ADMIN")
                        .requestMatchers("/api/rentals/**").hasAnyRole("CUSTOMER", "ADMIN")

                        // Transactions
                        .requestMatchers(HttpMethod.GET, "/api/transactions/history").hasAnyRole("CUSTOMER", "ADMIN")
                        .requestMatchers("/api/transactions/**").hasRole("ADMIN")

                        // Feedback
                        .requestMatchers(HttpMethod.POST, "/api/feedbacks").hasAnyRole("CUSTOMER", "ADMIN")

                        // Analytics & statistics (admin)
                        .requestMatchers("/api/analytics/**").hasRole("ADMIN")
                        .requestMatchers("/api/statistics/**").hasRole("ADMIN")

                        // Geofence zones (admin)
                        .requestMatchers("/api/geofence/**").hasRole("ADMIN")

                        // Fallback: any other request must be authenticated
                        .anyRequest().authenticated())
                .addFilterBefore(
                        new JwtAuthenticationFilter(jwtTokenProvider),
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
