package com.mitmit.config;

import com.mitmit.entity.Role;
import com.mitmit.entity.User;
import com.mitmit.entity.UserStatus;
import com.mitmit.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        
        if (email == null && oAuth2User.getAttribute("login") != null) {
            // For GitHub if email is private, sometimes login is used or we need another API call.
            // Using login as fallback name
            email = oAuth2User.getAttribute("login") + "@github.com";
            name = oAuth2User.getAttribute("login");
        }

        // Check if user exists
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            user = User.builder()
                    .id(UUID.randomUUID().toString())
                    .email(email)
                    .anonymousName(name != null ? name : "Anonymous")
                    .role(Role.USER)
                    .status(UserStatus.ACTIVE)
                    .build();
            userRepository.save(user);
        }

        // Generate JWT Token
        String token = jwtUtil.generateToken(user.getId());

        // Redirect to Frontend
        response.sendRedirect("http://localhost:3000/oauth2/redirect?token=" + token);
    }
}
