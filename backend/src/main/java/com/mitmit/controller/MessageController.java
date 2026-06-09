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
        messageService.sendMessage(senderId, messageRequest);
    }

    private static final String UPLOAD_DIR = "uploads/";

    @PostMapping("/upload")
    public ResponseEntity<String> uploadMedia(@RequestParam("file") MultipartFile file) {
        try {
            java.nio.file.Files.createDirectories(java.nio.file.Paths.get(UPLOAD_DIR));
            String filename = java.util.UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            java.nio.file.Path filePath = java.nio.file.Paths.get(UPLOAD_DIR + filename);
            java.nio.file.Files.write(filePath, file.getBytes());
            // Trả về URL để frontend có thể hiển thị
            String backendUrl = System.getenv("APP_BACKEND_URL");
            if (backendUrl == null || backendUrl.isEmpty()) {
                backendUrl = "http://localhost:8080";
            }
            return ResponseEntity.ok(backendUrl + "/uploads/" + filename);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Upload failed");
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
