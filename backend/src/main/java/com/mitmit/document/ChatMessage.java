package com.mitmit.document;

import lombok.*;
import jakarta.persistence.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {
    @Id
    private String id; // ObjectId của Mongo

    @Indexed
    private Long friendshipId; // Cái này để query tin nhắn theo phòng cực lẹ

    private String senderId;
    private String type; // TEXT hoặc VOICE
    private String content;
    private String replyToId;
    private String reaction;
    private boolean isUnsent = false;
    private LocalDateTime createdAt;
}