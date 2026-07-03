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

    private final com.mitmit.repository.UserRepository userRepository;

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
    public ResponseEntity<List<FeedbackResponse>> getAllFeedbacks() {
        List<Feedback> feedbacks = feedbackRepository.findAllByOrderByCreatedAtDesc();
        List<FeedbackResponse> responses = feedbacks.stream().map(f -> {
            com.mitmit.entity.User user = userRepository.findById(f.getUserId()).orElse(null);
            return FeedbackResponse.builder()
                    .id(f.getId())
                    .userId(f.getUserId())
                    .userName(user != null ? (user.getAnonymousName() != null ? user.getAnonymousName() : user.getEmail()) : "Unknown")
                    .avatarUrl(user != null ? user.getAvatarUrl() : null)
                    .rating(f.getRating())
                    .comment(f.getComment())
                    .createdAt(f.getCreatedAt())
                    .build();
        }).collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @lombok.Data
    @lombok.Builder
    public static class FeedbackResponse {
        private Long id;
        private String userId;
        private String userName;
        private String avatarUrl;
        private int rating;
        private String comment;
        private java.time.LocalDateTime createdAt;
    }
}
