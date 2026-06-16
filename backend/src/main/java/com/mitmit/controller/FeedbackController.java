package com.mitmit.controller;

import com.mitmit.entity.Feedback;
import com.mitmit.repository.FeedbackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/feedbacks")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackRepository feedbackRepository;

    @PostMapping
    public ResponseEntity<?> submitFeedback(Authentication authentication, @RequestBody Map<String, Object> payload) {
        String userId = authentication.getName();
        Integer rating = payload.get("rating") != null ? Integer.parseInt(payload.get("rating").toString()) : null;
        String comment = payload.get("comment") != null ? payload.get("comment").toString() : null;
        
        if (rating == null || rating < 1 || rating > 5) {
            return ResponseEntity.badRequest().body("Rating must be between 1 and 5");
        }

        Feedback feedback = Feedback.builder()
                .userId(userId)
                .rating(rating)
                .comment(comment)
                .build();

        feedbackRepository.save(feedback);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<Feedback>> getAllFeedbacks() {
        return ResponseEntity.ok(feedbackRepository.findAllByOrderByCreatedAtDesc());
    }
}
