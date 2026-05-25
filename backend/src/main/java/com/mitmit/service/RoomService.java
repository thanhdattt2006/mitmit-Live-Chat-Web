package com.mitmit.service;

import com.mitmit.document.ChatSession;
import com.mitmit.repository.ChatSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RedisService redisService;
    private final ChatSessionRepository chatSessionRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public void handleMatchDecision(String userId, String sessionId) {
        String key = "room_match:" + sessionId;
        
        // Add userId to the set representing users who liked in this session
        redisService.addToSetWithExpire(key, userId, 5); // expire in 5 minutes
        
        if (redisService.getSetSize(key) >= 2) {
            // Both matched!
            ChatSession session = chatSessionRepository.findById(sessionId).orElse(null);
            if (session != null) {
                session.setMatched(true);
                chatSessionRepository.save(session);
                
                // Note: Normally we'd fetch actual user data, but placeholder for now
                // Actually, the remote user info is what's needed. Let's let the frontend fetch it or send placeholder.
                Map<String, Object> payload = new HashMap<>();
                payload.put("matchedUserName", "Stranger");
                payload.put("matchedUserAvatar", "https://via.placeholder.com/150"); 
                
                messagingTemplate.convertAndSend("/topic/room/" + sessionId + "/match_success", payload);
            }
        }
    }

    @Scheduled(fixedDelay = 5000)
    public void processForceClose() {
        LocalDateTime cutoff = LocalDateTime.now().minusSeconds(180); // 3 minutes
        List<ChatSession> activeSessions = chatSessionRepository.findByStartedAtBeforeAndEndedAtIsNullAndIsMatchedFalse(cutoff);

        for (ChatSession session : activeSessions) {
            session.setEndedAt(LocalDateTime.now());
            chatSessionRepository.save(session);

            // Gói vào Map để ép Java hiểu đây là một Object (JSON), hết bị lú!
            Map<String, String> payload = new HashMap<>();
            payload.put("reason", "TIME_UP");

            // Notify frontend
            messagingTemplate.convertAndSend("/topic/room/" + session.getId() + "/force_close", payload);
        }
    }
}
