package com.mitmit.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.Customizer;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults()) // Dùng chung với CorsConfig đã cấu hình
            .csrf(csrf -> csrf.disable()) // Tắt CSRF để Postman/Axios gọi POST không bị chặn
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll() // TẠM THỜI MỞ CỬA TOÀN BỘ
            );
        return http.build();
    }
}
