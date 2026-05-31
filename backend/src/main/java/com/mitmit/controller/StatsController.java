package com.mitmit.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.user.SimpUserRegistry;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/stats")
@RequiredArgsConstructor
public class StatsController {

    private final com.mitmit.service.RedisService redisService;

    @GetMapping("/online-count")
    public ResponseEntity<Long> getOnlineCount() {
        return ResponseEntity.ok(redisService.getSetSize("online_users"));
    }
}
