package com.mitmit.controller;

import com.mitmit.service.FriendshipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/friendships")
@RequiredArgsConstructor
public class FriendshipController {

    private final FriendshipService friendshipService;

    @GetMapping("/inbox")
    public ResponseEntity<?> getUserInbox(@RequestParam String userId) {
        return ResponseEntity.ok(friendshipService.getUserInbox(userId));
    }

    @PostMapping("/{friendshipId}/block")
    public ResponseEntity<?> blockUser(@PathVariable Long friendshipId, @RequestParam String requesterId) {
        friendshipService.blockUser(friendshipId, requesterId);
        return ResponseEntity.ok("Đã chặn phòng chat thành công");
    }
}
