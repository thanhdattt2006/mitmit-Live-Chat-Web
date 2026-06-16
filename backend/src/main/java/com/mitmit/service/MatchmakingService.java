package com.mitmit.service;

import com.mitmit.document.ChatSession;
import com.mitmit.entity.User;
import com.mitmit.repository.ChatSessionRepository;
import com.mitmit.repository.FriendshipRepository;
import com.mitmit.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class MatchmakingService {

    private final RedisService redisService;
    private final ChatSessionRepository chatSessionRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;
    private final FriendshipRepository friendshipRepository;

    private static final String QUEUE_PREFIX = "queue:";
    private static final String BLACKLIST_PREFIX = "blacklist:";
    private static final long BLACKLIST_TIME = 5; // 5 phút
    private static final List<String> CALL_TYPES = Arrays.asList("video", "voice", "text");

    public void joinQueue(String userId, String callType) {
        String queueKey = QUEUE_PREFIX + callType;
        // 1. Xử lý Lỗi Duplicate Queue: Xóa user khỏi hàng đợi (nếu có) trước khi đẩy xuống cuối hàng
        redisService.removeFromQueue(queueKey, userId);
        redisService.pushToQueue(queueKey, userId);
    }

    @Scheduled(fixedDelay = 2000)
    public void processMatchmakingQueue() {
        for (String callType : CALL_TYPES) {
            tryMatch(callType);
        }
    }

    private void tryMatch(String callType) {
        String queueKey = QUEUE_PREFIX + callType;
        List<String> requeueUsers = new ArrayList<>();

        while (true) {
            try {
                String user1Id = redisService.popFromQueue(queueKey);
                if (user1Id == null) {
                    break;
                }

                String user2Id = redisService.popFromQueue(queueKey);
                if (user2Id == null) {
                    // Lẻ 1 người, đưa vào danh sách để requeue
                    requeueUsers.add(user1Id);
                    break;
                }

                // Xử lý Race Condition khi có nhiều luồng request joinQueue đồng thời (user tự khớp với chính mình)
                if (user1Id.equals(user2Id)) {
                    requeueUsers.add(user1Id);
                    continue;
                }

                // Chặn ghép cặp lại với Bạn Bè
                User user1 = userRepository.findById(user1Id).orElse(null);
                User user2 = userRepository.findById(user2Id).orElse(null);
                if (user1 != null && user2 != null && friendshipRepository.existsByUserIdAndFriendId(user1, user2)) {
                    requeueUsers.add(user1Id);
                    requeueUsers.add(user2Id);
                    continue;
                }

                // 2. Xử lý Lỗi Head-of-line blocking: Bỏ qua 2 user nằm trong Blacklist bằng continue
                // Sau đó cho vào danh sách requeueUsers để đẩy xuống CUỐI hàng chờ ở bên ngoài vòng lặp
                // Cách này tránh được hiện tượng treo vòng lặp vô hạn (Infinite loop)
                if (redisService.isMemberOfSet(BLACKLIST_PREFIX + user1Id, user2Id)) {
                    requeueUsers.add(user1Id);
                    requeueUsers.add(user2Id);
                    continue;
                }

                redisService.addToSetWithExpire(BLACKLIST_PREFIX + user1Id, user2Id, BLACKLIST_TIME);
                redisService.addToSetWithExpire(BLACKLIST_PREFIX + user2Id, user1Id, BLACKLIST_TIME);

                ChatSession session = ChatSession.builder()
                        .user1Id(user1Id)
                        .user2Id(user2Id)
                        .callType(callType)
                        .startedAt(LocalDateTime.now())
                        .build();

                // 3. Xử lý Nút thắt cổ chai I/O: Lưu vào Database và gửi Message qua websocket trên luồng Async
                // Điều này giúp vòng lặp tryMatch chạy hết tốc lực không bị blocking
                CompletableFuture.runAsync(() -> {
                    chatSessionRepository.save(session);

                    Map<String, Object> payload = new HashMap<>();
                    payload.put("sessionId", session.getId());
                    payload.put("user1Id", user1Id);
                    payload.put("user2Id", user2Id);
                    payload.put("endTime", System.currentTimeMillis() + 180000);

                    messagingTemplate.convertAndSend("/topic/match/" + user1Id, (Object) payload);
                    messagingTemplate.convertAndSend("/topic/match/" + user2Id, (Object) payload);
                });

            } catch (Exception e) {
                log.error("Lỗi matchmaking: ", e);
                break;
            }
        }

        // Re-queue: Đẩy các user chưa thể ghép đôi (Blacklist hoặc bị lẻ) xuống cuối hàng chờ
        for (String userId : requeueUsers) {
            redisService.pushToQueue(queueKey, userId);
        }
    }

    public void leaveQueue(String userId, String callType) {
        redisService.removeFromQueue(QUEUE_PREFIX + callType, userId);
    }

    public void leaveAllQueues(String userId) {
        for (String callType : CALL_TYPES) {
            redisService.removeFromQueue(QUEUE_PREFIX + callType, userId);
        }
    }
}
