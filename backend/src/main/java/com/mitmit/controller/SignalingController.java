package com.mitmit.controller;

import com.mitmit.dto.WebRTCSignal;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class SignalingController {

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/webrtc/signal")
    public void handleWebRTCSignal(@Payload WebRTCSignal signal) {
        // Forward the WebRTC signal to the specific target user's match topic
        messagingTemplate.convertAndSend("/topic/match/" + signal.getTargetUserId(), signal);
    }
}
