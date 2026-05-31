package com.mitmit.config;

import com.mitmit.entity.Role;
import com.mitmit.entity.User;
import com.mitmit.entity.UserStatus;
import com.mitmit.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    // Hardcoded frontend URL for now, could be moved to application.yaml
    private static final String FRONTEND_REDIRECT_URL = "http://localhost:3000/oauth2/redirect?token=";
    private static final String FRONTEND_ERROR_URL = "http://localhost:3000/?error=oauth2_failure";

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        try {
            // 1. Ép kiểu để lấy tên nhà cung cấp (google hoặc github)
            OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
            String registrationId = oauthToken.getAuthorizedClientRegistrationId(); 
            
            OAuth2User oAuth2User = oauthToken.getPrincipal();
            
            String email = oAuth2User.getAttribute("email");
            String name = oAuth2User.getAttribute("name");
            String openId = null;
            String avatarUrl = null;

            // 2. Lấy ID và Avatar đúng chuẩn của từng Provider
            if ("google".equalsIgnoreCase(registrationId)) {
                openId = oAuth2User.getAttribute("sub"); // Google dùng 'sub' làm ID
                avatarUrl = oAuth2User.getAttribute("picture"); // Google dùng 'picture' làm avatar
            } else if ("github".equalsIgnoreCase(registrationId)) {
                Object idObj = oAuth2User.getAttribute("id");
                openId = idObj != null ? String.valueOf(idObj) : null;
                avatarUrl = oAuth2User.getAttribute("avatar_url");
                
                // Fallback nếu GitHub không public email
                if (email == null) {
                    String login = oAuth2User.getAttribute("login");
                    if (login != null) {
                        email = login + "@github.com";
                        if (name == null) name = login;
                    }
                }
            }

            // Đảm bảo có email để tiếp tục xử lý
            if (email == null) {
                throw new IllegalStateException("OAuth2 user has no email");
            }

            // 3. Kiểm tra xem user đã tồn tại chưa
            User user = userRepository.findByEmail(email).orElse(null);

            if (user == null) {
                Role userRole = "dave.vo@gmail.com".equals(email) ? Role.ADMIN : Role.USER;

                // 3a. User mới: Lưu đầy đủ thông tin
                user = User.builder()
                        .id(UUID.randomUUID().toString())
                        .email(email)
                        .anonymousName(name != null ? name : "Anonymous")
                        .role(userRole)
                        .status(UserStatus.ACTIVE)
                        .avatarUrl(avatarUrl)
                        .build();
                
                if ("google".equalsIgnoreCase(registrationId)) {
                    user.setGoogleId(openId);
                } else if ("github".equalsIgnoreCase(registrationId)) {
                    user.setGithubId(openId);
                }
                
                userRepository.save(user);
                log.info("Created new user via {}: {}", registrationId, email);
            } else {
                // 3b. User cũ: Cập nhật lại những thông tin còn thiếu
                boolean needUpdate = false;
                
                // Cập nhật role nếu là admin nhưng chưa có quyền
                if ("dave.vo@gmail.com".equals(email) && user.getRole() != Role.ADMIN) {
                    user.setRole(Role.ADMIN);
                    needUpdate = true;
                }
                
                // Cập nhật avatar nếu trước đó chưa có
                if (user.getAvatarUrl() == null && avatarUrl != null) {
                    user.setAvatarUrl(avatarUrl);
                    needUpdate = true;
                }
                
                // Cập nhật Provider ID để sau này có thể tra cứu nhanh
                if ("google".equalsIgnoreCase(registrationId) && user.getGoogleId() == null) {
                    user.setGoogleId(openId);
                    needUpdate = true;
                } else if ("github".equalsIgnoreCase(registrationId) && user.getGithubId() == null) {
                    user.setGithubId(openId);
                    needUpdate = true;
                }
                
                if (needUpdate) {
                    userRepository.save(user);
                    log.info("Updated existing user info via {}: {}", registrationId, email);
                }
            }

            // 4. Generate JWT Token & Redirect
            String token = jwtUtil.generateToken(user.getId());
            response.sendRedirect(FRONTEND_REDIRECT_URL + token);

        } catch (Exception e) {
            log.error("Error occurred during OAuth2 authentication success handler", e);
            // Redirect về frontend kèm param báo lỗi để UI có thể hiển thị Toast hoặc Alert
            response.sendRedirect(FRONTEND_ERROR_URL);
        }
    }
}
