package com.mitmit.controller;

import com.mitmit.document.ChatMessage;
import com.mitmit.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @GetMapping
    public ResponseEntity<List<ChatMessage>> getMessages(@RequestParam Long friendshipId) {
        return ResponseEntity.ok(messageService.getMessages(friendshipId));
    }

    @PostMapping
    public ResponseEntity<ChatMessage> sendMessage(
            Authentication authentication,
            @RequestBody ChatMessage messageRequest) {
        String senderId = (String) authentication.getPrincipal();
        return ResponseEntity.ok(messageService.sendMessage(senderId, messageRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> unsendMessage(@PathVariable String id) {
        messageService.unsendMessage(id);
        return ResponseEntity.ok().build();
    }
}
