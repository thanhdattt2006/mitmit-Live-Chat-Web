package com.mitmit.service;

import com.mitmit.document.ChatSession;
import com.mitmit.entity.Friendship;
import com.mitmit.entity.FriendshipStatus;
import com.mitmit.entity.User;
import com.mitmit.repository.ChatSessionRepository;
import com.mitmit.repository.FriendshipRepository;
import com.mitmit.repository.UserRepository;
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
    private final UserRepository userRepository;
    private final FriendshipRepository friendshipRepository;

    public void handleMatchDecision(String userId, String sessionId) {
        String key = "room_match:" + sessionId;
        
        // Add userId to the set representing users who liked in this session
        redisService.addToSetWithExpire(key, userId, 5); // expire in 5 minutes
        
        if (redisService.getSetSize(key) >= 2) {
            String lockKey = "lock:room_match:" + sessionId;
            if (!redisService.setIfAbsent(lockKey, "locked", 10)) {
                return; // Luồng khác đã xử lý rồi
            }

            // Both matched!
            ChatSession session = chatSessionRepository.findById(sessionId).orElse(null);
            if (session != null) {
                session.setMatched(true);
                chatSessionRepository.save(session);
                
                String user1Id = session.getUser1Id();
                String user2Id = session.getUser2Id();
                
                User user1 = userRepository.findById(user1Id).orElse(null);
                User user2 = userRepository.findById(user2Id).orElse(null);
                
                if (user1 != null && user2 != null) {
                    user1.setMatchCount(user1.getMatchCount() + 1);
                    user2.setMatchCount(user2.getMatchCount() + 1);
                    userRepository.saveAll(java.util.Arrays.asList(user1, user2));

                    if (!friendshipRepository.existsByUserIdAndFriendId(user1, user2)) {
                        Friendship f1 = Friendship.builder()
                                .user1(user1)
                                .user2(user2)
                                .status(FriendshipStatus.MATCHED)
                                .build();
                        friendshipRepository.save(f1);
                        
                        Friendship f2 = Friendship.builder()
                                .user1(user2)
                                .user2(user1)
                                .status(FriendshipStatus.MATCHED)
                                .build();
                        friendshipRepository.save(f2);
                    }
                    
                    Map<String, Object> payload = new HashMap<>();
                    payload.put("user1Id", user1Id);
                    payload.put("user1Name", user1.getAnonymousName());
                    payload.put("user1Avatar", user1.getAvatarUrl() != null ? user1.getAvatarUrl() : "https://via.placeholder.com/150");
                    
                    payload.put("user2Id", user2Id);
                    payload.put("user2Name", user2.getAnonymousName());
                    payload.put("user2Avatar", user2.getAvatarUrl() != null ? user2.getAvatarUrl() : "https://via.placeholder.com/150");

                    messagingTemplate.convertAndSend("/topic/room/" + sessionId + "/match_success", (Object) payload);
                    
                    messagingTemplate.convertAndSend("/topic/match/" + user1Id, (Object) Map.of("type", "REFRESH_FRIENDS"));
                    messagingTemplate.convertAndSend("/topic/match/" + user2Id, (Object) Map.of("type", "REFRESH_FRIENDS"));
                }
            }
        }
    }

    public void handleLeaveRoom(String userId, String sessionId) {
        ChatSession session = chatSessionRepository.findById(sessionId).orElse(null);
        if (session != null && session.getEndedAt() == null) {
            session.setEndedAt(LocalDateTime.now());
            chatSessionRepository.save(session);
            
            Map<String, String> payload = new HashMap<>();
            payload.put("reason", "PARTNER_LEFT");
            messagingTemplate.convertAndSend("/topic/room/" + sessionId + "/partner_left", payload);
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
