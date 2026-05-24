package com.mitmit.config;

import com.mitmit.service.MatchmakingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    private final MatchmakingService matchmakingService;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        
        // Lấy userId từ header do frontend gửi lên
        List<String> userIds = accessor.getNativeHeader("userId");
        if (userIds != null && !userIds.isEmpty()) {
            String userId = userIds.get(0);
            Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
            if (sessionAttributes != null) {
                // Lưu userId vào session attributes để dùng khi ngắt kết nối
                sessionAttributes.put("userId", userId);
            }
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());

        Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
        if (sessionAttributes != null && sessionAttributes.containsKey("userId")) {
            String userId = (String) sessionAttributes.get("userId");

            // Xóa userId này khỏi TẤT CẢ các hàng đợi (Video, Voice, Text)
            matchmakingService.leaveQueue(userId, "video");
            matchmakingService.leaveQueue(userId, "voice");
            matchmakingService.leaveQueue(userId, "text");
            
            log.info("Ghost User Cleanup: Đã xóa user {} khỏi mọi hàng chờ do ngắt kết nối.", userId);
        }
    }
}
