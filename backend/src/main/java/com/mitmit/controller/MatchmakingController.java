package com.mitmit.controller;

import com.mitmit.service.MatchmakingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/matchmaking")
@RequiredArgsConstructor
public class MatchmakingController {

    private final MatchmakingService matchmakingService;

    @PostMapping("/join")
    public ResponseEntity<?> joinQueue(org.springframework.security.core.Authentication authentication, @RequestParam String callType) {
        String userId = (String) authentication.getPrincipal();
        matchmakingService.joinQueue(userId, callType);
        return ResponseEntity.ok("Đã vào hàng chờ " + callType);
    }

    @PostMapping("/leave")
    public ResponseEntity<?> leaveQueue(org.springframework.security.core.Authentication authentication, @RequestParam String callType) {
        String userId = (String) authentication.getPrincipal();
        matchmakingService.leaveQueue(userId, callType);
        return ResponseEntity.ok("Đã rời hàng chờ");
    }
}
