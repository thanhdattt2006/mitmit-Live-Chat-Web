package com.mitmit.controller;

import com.mitmit.dto.MatchRequest;
import com.mitmit.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/room")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @PostMapping("/match")
    public ResponseEntity<?> makeMatchDecision(@RequestBody MatchRequest request) {
        roomService.processMatchDecision(request.getSessionId(), request.getUserId());
        return ResponseEntity.ok("Đã ghi nhận quyết định thả tim.");
    }
}
