package com.mitmit.controller;

import com.mitmit.document.ChatMessage;
import com.mitmit.service.MessageService;
import com.mitmit.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import com.mitmit.service.ProfanityFilterService;
import com.mitmit.repository.UserRepository;
import com.mitmit.entity.User;
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
    private final ProfanityFilterService profanityFilterService;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

    @GetMapping("/{friendshipId}")
    public ResponseEntity<org.springframework.data.domain.Page<ChatMessage>> getMessages(
            @PathVariable Long friendshipId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(messageService.getMessages(friendshipId, page, size));
    }

    @MessageMapping("/chat.private")
    public void handlePrivateMessage(Authentication authentication, @Payload ChatMessage messageRequest) {
        if (authentication == null || authentication.getName() == null) {
            throw new SecurityException("Unauthorized STOMP connection");
        }
        String senderId = authentication.getName();
        User user = userRepository.findById(senderId).orElse(null);
        if (user != null && user.isMuted()) {
            throw new SecurityException("Bạn đã bị cấm chat do vi phạm tiêu chuẩn cộng đồng.");
        }
        
        if (messageRequest.getType() == null || messageRequest.getType().equals("TEXT")) {
            if (profanityFilterService.containsProfanityOrLink(messageRequest.getContent())) {
                profanityFilterService.processViolation(senderId);
                throw new IllegalArgumentException("Tin nhắn chứa từ ngữ vi phạm hoặc liên kết không được phép.");
            }
        }

        messageService.sendMessage(senderId, messageRequest);
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadMedia(@RequestParam("file") MultipartFile file) {
        try {
            String secureUrl = cloudinaryService.uploadFile(file);
            return ResponseEntity.ok(secureUrl);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<ChatMessage> sendMessage(
            Authentication authentication,
            @RequestBody ChatMessage messageRequest) {
        if (authentication == null || authentication.getName() == null) {
            throw new SecurityException("Unauthorized HTTP request");
        }
        String senderId = authentication.getName();
        User user = userRepository.findById(senderId).orElse(null);
        if (user != null && user.isMuted()) {
            throw new SecurityException("Bạn đã bị cấm chat do vi phạm tiêu chuẩn cộng đồng.");
        }

        if (messageRequest.getType() == null || messageRequest.getType().equals("TEXT")) {
            if (profanityFilterService.containsProfanityOrLink(messageRequest.getContent())) {
                profanityFilterService.processViolation(senderId);
                throw new IllegalArgumentException("Tin nhắn chứa từ ngữ vi phạm hoặc liên kết không được phép.");
            }
        }

        return ResponseEntity.ok(messageService.sendMessage(senderId, messageRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> unsendMessage(@PathVariable String id) {
        messageService.unsendMessage(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/reaction")
    public ResponseEntity<ChatMessage> reactToMessage(@PathVariable String id, @RequestParam String reaction) {
        return ResponseEntity.ok(messageService.reactToMessage(id, reaction));
    }
}
