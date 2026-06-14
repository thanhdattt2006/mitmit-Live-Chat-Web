package com.mitmit.controller;

import com.mitmit.dto.WebRTCSignal;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import com.mitmit.service.ProfanityFilterService;
import com.mitmit.repository.UserRepository;
import com.mitmit.entity.User;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class SignalingController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ProfanityFilterService profanityFilterService;
    private final UserRepository userRepository;

    @MessageMapping("/webrtc/signal")
    public void handleWebRTCSignal(@Payload WebRTCSignal signal) {
        // Forward the WebRTC signal to the specific target user's match topic
        messagingTemplate.convertAndSend("/topic/match/" + signal.getTargetUserId(), signal);
    }

    @MessageMapping("/room/{sessionId}/chat")
    public void handleRoomChat(Authentication authentication, @org.springframework.messaging.handler.annotation.DestinationVariable String sessionId, @Payload java.util.Map<String, Object> payload) {
        if (authentication == null || authentication.getName() == null) {
            throw new SecurityException("Unauthorized");
        }
        String senderId = authentication.getName();
        User user = userRepository.findById(senderId).orElse(null);
        if (user != null && user.isMuted()) {
            throw new SecurityException("Bạn đã bị cấm chat do vi phạm tiêu chuẩn cộng đồng.");
        }

        if (payload.containsKey("content") && payload.get("content") != null) {
            String content = payload.get("content").toString();
            if (profanityFilterService.containsProfanityOrLink(content)) {
                profanityFilterService.processViolation(senderId);
                throw new IllegalArgumentException("Tin nhắn chứa từ ngữ vi phạm hoặc liên kết không được phép.");
            }
        }
        messagingTemplate.convertAndSend("/topic/room/" + sessionId + "/chat", (Object) payload);
    }
}
