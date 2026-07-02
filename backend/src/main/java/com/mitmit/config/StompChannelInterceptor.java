package com.mitmit.config;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
public class StompChannelInterceptor implements ChannelInterceptor {

    private final JwtUtil jwtUtil;
    private final com.mitmit.service.RedisService redisService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null) {
            if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                String token = null;

                // 1. Lấy token từ Session Attributes (do HandshakeInterceptor nạp từ HttpOnly
                // Cookie)
                java.util.Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
                if (sessionAttributes != null && sessionAttributes.containsKey("jwt_token")) {
                    token = (String) sessionAttributes.get("jwt_token");
                }

                // 2. Fallback: Lấy từ Header Native (Cho Postman)
                if (token == null) {
                    token = accessor.getFirstNativeHeader("Authorization");
                    if (org.springframework.util.StringUtils.hasText(token) && token.startsWith("Bearer ")) {
                        token = token.substring(7);
                    }
                }

                if (org.springframework.util.StringUtils.hasText(token) && jwtUtil.validateToken(token)) {
                    String userId = jwtUtil.extractUserId(token);
                    Authentication auth = new UsernamePasswordAuthenticationToken(userId, null, null);

                    // 1. Tạo bản sao Mutable (có thể chỉnh sửa) từ Message ban đầu
                    StompHeaderAccessor mutableAccessor = StompHeaderAccessor.wrap(message);
                    
                    // 2. Gắn User hợp lệ vào
                    mutableAccessor.setUser(auth);

                    // 3. Lưu userId vào SessionAttributes
                    java.util.Map<String, Object> mutableSessionAttributes = mutableAccessor.getSessionAttributes();
                    if (mutableSessionAttributes != null) {
                        mutableSessionAttributes.put("userId", userId);

                        // ĐẾM ONLINE NGAY TẠI ĐÂY!
                        redisService.addToSet("online_users", userId);
                    }
                    
                    // 4. Trả về Message MỚI đã được gắn User (Cực kỳ quan trọng để không bị Crash)
                    return org.springframework.messaging.support.MessageBuilder.createMessage(message.getPayload(), mutableAccessor.getMessageHeaders());
                } else {
                    throw new IllegalArgumentException("Invalid or missing JWT token");
                }
            } else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
                String destination = accessor.getDestination();
                if (destination != null) {
                    Authentication auth = (Authentication) accessor.getUser();
                    if (auth == null) {
                        throw new org.springframework.security.access.AccessDeniedException(
                                "Not authenticated for STOMP");
                    }
                    String userId = auth.getName();
                    if (destination.startsWith("/topic/match/")) {
                        String targetId = destination.substring("/topic/match/".length());
                        if (!userId.equals(targetId)) {
                            throw new org.springframework.security.access.AccessDeniedException("IDOR detected");
                        }
                    } else if (destination.startsWith("/queue/chat-")) {
                        String targetId = destination.substring("/queue/chat-".length());
                        if (!userId.equals(targetId)) {
                            throw new org.springframework.security.access.AccessDeniedException("IDOR detected");
                        }
                    }
                }
            }
        }
        return message;
    }
}
