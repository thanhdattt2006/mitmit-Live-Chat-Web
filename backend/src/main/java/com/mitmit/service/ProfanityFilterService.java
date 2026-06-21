package com.mitmit.service;

import com.mitmit.entity.User;
import com.mitmit.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class ProfanityFilterService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // Pattern to match URLs
    private static final Pattern URL_PATTERN = Pattern.compile(
            "(?:(?:https?|ftp):\\/\\/)?(?:\\S+(?::\\S*)?@)?(?:(?!(?:10|127)(?:\\.\\d{1,3}){3})(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))\\.?)(?::\\d{2,5})?(?:[/?#]\\S*)?",
            Pattern.CASE_INSENSITIVE
    );

    // Vietnamese bad words (example list)
    private static final List<String> BAD_WORDS = Arrays.asList(
            "đụ", "đĩ", "lồn", "cặc", "buồi", "chó đẻ", "địt", "phò", "địt mẹ", "vkl", "vcl", "vl", "đm"
    );

    public boolean containsProfanityOrLink(String text) {
        if (text == null || text.trim().isEmpty()) {
            return false;
        }
        
        // Check links
        if (URL_PATTERN.matcher(text).find()) {
            return true;
        }

        // Check bad words
        for (String word : BAD_WORDS) {
            String regex = "(?i)(^|\\s)(" + word + ")($|\\s|[.,!?])";
            if (Pattern.compile(regex).matcher(text).find()) {
                return true;
            }
        }
        return false;
    }

    public void processViolation(String userId) {
        String key = "STRIKE:" + userId;
        Long currentStrikes = redisTemplate.opsForValue().increment(key);
        
        if (currentStrikes != null && currentStrikes == 1) {
            // Set TTL for 24 hours on the first strike
            redisTemplate.expire(key, 24, TimeUnit.HOURS);
        }

        if (currentStrikes != null && currentStrikes >= 3) {
            // Mute user
            User user = userRepository.findById(userId).orElse(null);
            if (user != null && !user.isMuted()) {
                user.setMuted(true);
                userRepository.save(user);
                
                // Send STOMP signal to user to log them out or show message
                messagingTemplate.convertAndSend("/queue/chat-" + userId, "{\"type\": \"SYSTEM_MUTE\", \"content\": \"Bạn đã bị cấm chat do vi phạm tiêu chuẩn cộng đồng.\"}");
            }
        }
    }
}
