package com.mitmit.controller;

import com.mitmit.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/room")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @PostMapping("/match")
    public ResponseEntity<?> sendMatchDecision(@RequestParam String userId, @RequestParam String sessionId) {
        roomService.handleMatchDecision(userId, sessionId);
        return ResponseEntity.ok().build();
    }
}
