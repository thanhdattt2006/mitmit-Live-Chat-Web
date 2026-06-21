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
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
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

    @org.springframework.beans.factory.annotation.Value("${app.frontend.url}")
    private String frontendUrl;

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

            // 2. Lấy ID và Avatar đúng chuẩn của Provider
            if ("google".equalsIgnoreCase(registrationId)) {
                openId = oAuth2User.getAttribute("sub"); // Google dùng 'sub' làm ID
                avatarUrl = oAuth2User.getAttribute("picture"); // Google dùng 'picture' làm avatar
            } else if ("github".equalsIgnoreCase(registrationId)) {
                openId = String.valueOf(oAuth2User.getAttribute("id"));
                avatarUrl = oAuth2User.getAttribute("avatar_url");
            }

            // Đảm bảo có email để tiếp tục xử lý
            if (email == null) {
                throw new IllegalStateException("OAuth2 user has no email");
            }

            // 3. Kiểm tra xem user đã tồn tại chưa
            User user = userRepository.findByEmail(email).orElse(null);

            if (user == null) {
                // 3a. User mới: Mặc định luôn luôn là USER. Phân quyền ADMIN phải làm thủ công trong DB.
                user = User.builder()
                        .id(UUID.randomUUID().toString())
                        .email(email)
                        .anonymousName(name != null ? name : "Anonymous")
                        .role(Role.USER)
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
                // 3b. User cũ: Cập nhật thông tin
                
                // BẢO MẬT ADMIN SPOOFING: 
                // Nếu tài khoản trong DB đang là ADMIN, nhưng phương thức đăng nhập KHÔNG PHẢI Google -> Chặn ngay lập tức!
                // Tránh việc hacker tạo acc Github có email trùng với Admin để cướp tài khoản.
                if (user.getRole() == Role.ADMIN && !"google".equalsIgnoreCase(registrationId)) {
                    log.warn("SECURITY ALERT: Attempted Admin login via {} for email {}", registrationId, email);
                    throw new SecurityException("Admin accounts must login via Google");
                }

                boolean needUpdate = false;
                
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
            
            // BẢO MẬT: Đẩy Token vào HttpOnly Cookie + Thêm SameSite để không bị trình duyệt block khi khác port
            ResponseCookie cookie = ResponseCookie.from("jwt_token", token)
                    .httpOnly(true)
                    .secure(false) // Set to true if using HTTPS
                    .path("/")
                    .maxAge(30 * 24 * 60 * 60) // 30 ngày
                    .sameSite("Lax") // Tránh bị block cookie khi Frontend và Backend khác port ở localhost
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

            response.sendRedirect(frontendUrl.split(",")[0] + "/oauth2/redirect");

        } catch (Exception e) {
            log.error("Error occurred during OAuth2 authentication success handler", e);
            // Redirect về frontend kèm param báo lỗi để UI có thể hiển thị Toast hoặc Alert
            response.sendRedirect(frontendUrl.split(",")[0] + "/?error=oauth2_failure");
        }
    }
}
