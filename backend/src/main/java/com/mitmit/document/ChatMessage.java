package com.mitmit.document;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "chat_messages")
@CompoundIndexes({
    @CompoundIndex(name = "friendship_createdAt_idx", def = "{'friendshipId': 1, 'createdAt': -1}")
})
public class ChatMessage {
    @Id
    private String id; // ObjectId của Mongo

    private Long friendshipId; // Cái này để query tin nhắn theo phòng cực lẹ

    private String senderId;
    private String type; // TEXT hoặc VOICE hoặc IMAGE
    private String content;
    private String replyToId;
    private String reaction;
    private Boolean isUnsent = false;
    private LocalDateTime createdAt;
}
