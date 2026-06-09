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

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null) {
            if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                String token = accessor.getFirstNativeHeader("Authorization");
                if (StringUtils.hasText(token) && token.startsWith("Bearer ")) {
                    token = token.substring(7);
                    if (jwtUtil.validateToken(token)) {
                        String userId = jwtUtil.extractUserId(token);
                        Authentication auth = new UsernamePasswordAuthenticationToken(userId, null, null);
                        accessor.setUser(auth);
                    } else {
                        throw new IllegalArgumentException("Invalid JWT token");
                    }
                } else {
                    throw new IllegalArgumentException("Missing JWT token");
                }
            } else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
                String destination = accessor.getDestination();
                if (destination != null) {
                    Authentication auth = (Authentication) accessor.getUser();
                    if (auth == null) {
                        throw new org.springframework.security.access.AccessDeniedException("Not authenticated for STOMP");
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
