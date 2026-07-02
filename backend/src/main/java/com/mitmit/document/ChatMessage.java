package com.mitmit.document;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.HashMap;

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
    @jakarta.validation.constraints.Size(max = 2000, message = "Nội dung tin nhắn không được vượt quá 2000 ký tự")
    private String content;
    private String replyToId;
    @Builder.Default
    private Map<String, String> reactions = new HashMap<>();
    private Boolean isUnsent = false;
    private LocalDateTime createdAt;
}
