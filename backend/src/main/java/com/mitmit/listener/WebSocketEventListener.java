package com.mitmit.listener;

import com.mitmit.service.MatchmakingService;
import com.mitmit.service.RoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    private final MatchmakingService matchmakingService;
    private final RoomService roomService;
    private final com.mitmit.service.RedisService redisService;
    private static final String ONLINE_USERS_KEY = "online_users";



    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Map<String, Object> sessionAttributes = headerAccessor.getSessionAttributes();
        if (sessionAttributes != null) {
            String userId = (String) sessionAttributes.get("userId");
            if (userId != null) {
                log.info("User disconnected: {}, removing from all matchmaking queues", userId);
                matchmakingService.leaveAllQueues(userId);
                redisService.removeFromSet(ONLINE_USERS_KEY, userId);
                roomService.handleSuddenDisconnect(userId);
            }
        }
    }
}
