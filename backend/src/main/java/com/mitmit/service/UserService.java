package com.mitmit.service;

import com.mitmit.entity.Role;
import com.mitmit.entity.User;
import com.mitmit.entity.UserStatus;
import com.mitmit.repository.BanRepository;
import com.mitmit.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final BanRepository banRepository;

    public User loginOrRegister(String email, String googleId, String avatarUrl) {
        Optional<User> optionalUser = userRepository.findByEmail(email);

        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            if (banRepository.existsByUser_Id(user.getId())) {
                throw new RuntimeException("Tài khoản đã bị cấm!");
            }
            if (avatarUrl != null && !avatarUrl.equals(user.getAvatarUrl())) {
                user.setAvatarUrl(avatarUrl);
                userRepository.save(user);
            }
            return user;
        } else {
            String anonymousName = "Người lạ #" + (new Random().nextInt(9000) + 1000);
            User newUser = User.builder()
                    .id(UUID.randomUUID().toString())
                    .email(email)
                    .googleId(googleId)

                    .avatarUrl(avatarUrl)
                    .anonymousName(anonymousName)
                    .role(Role.USER)
                    .status(UserStatus.ACTIVE)
                    .build();
            return userRepository.save(newUser);
        }
    }
}
