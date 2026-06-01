package com.mitmit.controller;

import com.mitmit.document.ChatMessage;
import com.mitmit.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @GetMapping("/{friendshipId}")
    public ResponseEntity<List<ChatMessage>> getMessages(@PathVariable Long friendshipId) {
        return ResponseEntity.ok(messageService.getMessages(friendshipId));
    }

    @MessageMapping("/chat.private")
    public void handlePrivateMessage(Authentication authentication, @Payload ChatMessage messageRequest) {
        String senderId = messageRequest.getSenderId();
        if (authentication != null && authentication.getPrincipal() != null) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof String) {
                senderId = (String) principal;
            } else if (principal instanceof org.springframework.security.oauth2.core.user.OAuth2User) {
                // For OAuth2 sessions, we rely on the payload's senderId for now 
                // or we could lookup by email.
                // senderId remains messageRequest.getSenderId()
            } else if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
                senderId = ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
            } else {
                senderId = authentication.getName();
            }
        }
        messageService.sendMessage(senderId, messageRequest);
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadMedia(@RequestParam("file") MultipartFile file) {
        try {
            String type = file.getContentType();
            String base64 = java.util.Base64.getEncoder().encodeToString(file.getBytes());
            return ResponseEntity.ok("data:" + type + ";base64," + base64);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Upload failed");
        }
    }

    @PostMapping
    public ResponseEntity<ChatMessage> sendMessage(
            Authentication authentication,
            @RequestBody ChatMessage messageRequest) {
        String senderId = messageRequest.getSenderId();
        if (authentication != null && authentication.getPrincipal() != null) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof String) {
                senderId = (String) principal;
            } else if (principal instanceof org.springframework.security.oauth2.core.user.OAuth2User) {
                // Keep senderId from payload
            } else if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
                senderId = ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
            } else {
                senderId = authentication.getName();
            }
        }
        return ResponseEntity.ok(messageService.sendMessage(senderId, messageRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> unsendMessage(@PathVariable String id) {
        messageService.unsendMessage(id);
        return ResponseEntity.ok().build();
    }
}
