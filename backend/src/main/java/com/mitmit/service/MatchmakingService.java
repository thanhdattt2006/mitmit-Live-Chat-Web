package com.mitmit.service;

import com.mitmit.document.ChatSession;
import com.mitmit.repository.ChatSessionRepository;
import com.mitmit.repository.FriendshipRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MatchmakingService {

    private final RedisService redisService;
    private final UserService userService;
    private final ChatSessionRepository chatSessionRepository;
    private final FriendshipRepository friendshipRepository;
    private final SimpMessagingTemplate messagingTemplate;

    private static final String QUEUE_PREFIX = "queue:";
    private static final String BLACKLIST_PREFIX = "blacklist:";
    private static final long BLACKLIST_TIME = 5; // 5 phút
    private static final List<String> CALL_TYPES = Arrays.asList("video", "voice", "text");

    public void joinQueue(String userId, String callType) {
        redisService.pushToQueue(QUEUE_PREFIX + callType, userId);
    }

    @Scheduled(fixedDelay = 2000)
    public void processMatchmakingQueue() {
        for (String callType : CALL_TYPES) {
            tryMatch(callType);
        }
    }

    private void tryMatch(String callType) {
        while (true) {
            try {
                String user1Id = redisService.popFromQueue(QUEUE_PREFIX + callType);
                if (user1Id == null) {
                    break;
                }

                String user2Id = redisService.popFromQueue(QUEUE_PREFIX + callType);
                if (user2Id == null) {
                    redisService.pushToQueue(QUEUE_PREFIX + callType, user1Id);
                    break;
                }

                if (redisService.isMemberOfSet(BLACKLIST_PREFIX + user1Id, user2Id)) {
                    redisService.pushToQueue(QUEUE_PREFIX + callType, user1Id);
                    redisService.pushToQueue(QUEUE_PREFIX + callType, user2Id);
                    break;
                }

                redisService.addToSetWithExpire(BLACKLIST_PREFIX + user1Id, user2Id, BLACKLIST_TIME);
                redisService.addToSetWithExpire(BLACKLIST_PREFIX + user2Id, user1Id, BLACKLIST_TIME);

                ChatSession session = ChatSession.builder()
                        .user1Id(user1Id)
                        .user2Id(user2Id)
                        .callType(callType)
                        .startedAt(LocalDateTime.now())
                        .build();
                chatSessionRepository.save(session);

                Map<String, Object> payload = new HashMap<>();
                payload.put("sessionId", session.getId());
                payload.put("user1Id", user1Id);
                payload.put("user2Id", user2Id);

                messagingTemplate.convertAndSend("/topic/match/" + user1Id, (Object) payload);
                messagingTemplate.convertAndSend("/topic/match/" + user2Id, (Object) payload);

            } catch (Exception e) {
                e.printStackTrace();
                break;
            }
        }
    }

    public void leaveQueue(String userId, String callType) {
        redisService.removeFromQueue(QUEUE_PREFIX + callType, userId);
    }
}
