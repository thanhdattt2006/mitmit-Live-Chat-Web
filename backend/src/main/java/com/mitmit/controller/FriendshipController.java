package com.mitmit.controller;

import com.mitmit.service.FriendshipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/friendships")
@RequiredArgsConstructor
public class FriendshipController {

    private final FriendshipService friendshipService;

    @GetMapping("/inbox")
    public ResponseEntity<?> getUserInbox(org.springframework.security.core.Authentication authentication) {
        String userId = (String) authentication.getPrincipal();
        return ResponseEntity.ok(friendshipService.getUserInbox(userId));
    }

    @PostMapping("/{friendshipId}/block")
    public ResponseEntity<?> blockUser(@PathVariable Long friendshipId, org.springframework.security.core.Authentication authentication) {
        String requesterId = (String) authentication.getPrincipal();
        friendshipService.blockUser(friendshipId, requesterId);
        return ResponseEntity.ok("Đã chặn phòng chat thành công");
    }

    @DeleteMapping("/{friendId}")
    public ResponseEntity<?> unfriend(@PathVariable String friendId, org.springframework.security.core.Authentication authentication) {
        String userId = (String) authentication.getPrincipal();
        friendshipService.unfriend(userId, friendId);
        return ResponseEntity.ok().build();
    }
}
