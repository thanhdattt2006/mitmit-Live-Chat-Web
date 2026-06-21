package com.mitmit.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "users",
    indexes = {
        @Index(name = "idx_user_email", columnList = "email", unique = true),
        @Index(name = "idx_user_google_id", columnList = "googleId", unique = true)
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @Column(length = 36)
    private String id; // UUID tự tăng

    @Column(unique = true)
    private String googleId;

    @Column(unique = true)
    private String githubId;


    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String anonymousName;

    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    private Role role; // Tạo thêm 1 Enum Role {USER, ADMIN}

    @Enumerated(EnumType.STRING)
    private UserStatus status; // Tạo thêm 1 Enum UserStatus {ACTIVE, BANNED}

    @Builder.Default
    @Column(nullable = false, columnDefinition = "int default 0")
    private int matchCount = 0;

    @Builder.Default
    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean isMuted = false;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
}
