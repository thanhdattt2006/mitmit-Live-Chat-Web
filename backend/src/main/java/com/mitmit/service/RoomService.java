package com.mitmit.service;

import com.mitmit.document.ChatSession;
import com.mitmit.entity.Friendship;
import com.mitmit.entity.FriendshipStatus;
import com.mitmit.entity.User;
import com.mitmit.repository.ChatSessionRepository;
import com.mitmit.repository.FriendshipRepository;
import com.mitmit.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoomService {

    private final RedisService redisService;
    private final ChatSessionRepository chatSessionRepository;
    private final UserRepository userRepository;
    private final FriendshipRepository friendshipRepository;
    private final SimpMessagingTemplate messagingTemplate;

    private static final String ROOM_MATCH_PREFIX = "room_match:";
    private static final long MATCH_TIMEOUT_MINUTES = 5;

    @Transactional
    public void processMatchDecision(String sessionId, String userId) {
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session không tồn tại"));

        String otherUserId;
        if (userId.equals(session.getUser1Id())) {
            otherUserId = session.getUser2Id();
        } else if (userId.equals(session.getUser2Id())) {
            otherUserId = session.getUser1Id();
        } else {
            throw new RuntimeException("User không thuộc phòng này");
        }

        // 1. Lưu cờ vào Redis cho user hiện tại (lưu dưới dạng Set chứa các userId đã thả tim trong phòng)
        String myKey = ROOM_MATCH_PREFIX + sessionId;
        redisService.addToSetWithExpire(myKey, userId, MATCH_TIMEOUT_MINUTES);

        // 2. Kiểm tra xem người đối diện đã thả tim chưa
        boolean isOtherMatched = redisService.isMemberOfSet(myKey, otherUserId);

        if (isOtherMatched) {
            // CẢ HAI ĐỀU THẢ TIM
            User user1 = userRepository.findById(session.getUser1Id())
                    .orElseThrow(() -> new RuntimeException("User 1 không tồn tại"));
            User user2 = userRepository.findById(session.getUser2Id())
                    .orElseThrow(() -> new RuntimeException("User 2 không tồn tại"));

            // 3. Lưu vào bảng Friendship
            if (!friendshipRepository.existsByUser1AndUser2(user1, user2) &&
                !friendshipRepository.existsByUser1AndUser2(user2, user1)) {
                
                Friendship friendship = Friendship.builder()
                        .user1(user1)
                        .user2(user2)
                        .status(FriendshipStatus.MATCHED)
                        .build();
                friendshipRepository.save(friendship);
                log.info("Lưu thành công Friendship giữa {} và {}", user1.getId(), user2.getId());
            }

            // 4. Xóa data tạm của phòng này trong Redis
            redisService.deleteKey(myKey);

            // 5. Bắn event WebSocket chứa thông tin thật (Avatar, Name)
            Map<String, Object> matchInfo = new HashMap<>();
            matchInfo.put("type", "match_success");
            matchInfo.put("user1", mapToUserInfo(user1));
            matchInfo.put("user2", mapToUserInfo(user2));

            messagingTemplate.convertAndSend("/topic/room/" + sessionId + "/match_success", (Object) matchInfo);
            log.info("Đã gửi event match_success cho phòng {}", sessionId);
        }
    }

    private Map<String, Object> mapToUserInfo(User user) {
        Map<String, Object> info = new HashMap<>();
        info.put("id", user.getId());
        
        // Trả về thông tin "thật" của user sau khi match thành công
        String realName = (user.getEmail() != null) ? user.getEmail().split("@")[0] : user.getAnonymousName();
        info.put("name", realName); 
        info.put("email", user.getEmail());
        info.put("avatarUrl", user.getAvatarUrl());
        return info;
    }
}
