package com.mitmit.document;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "chat_sessions")
public class ChatSession {

    @Id
    private String id;

    private String user1Id;

    private String user2Id;

    private String callType;

    private LocalDateTime startedAt;

    private LocalDateTime endedAt;
}
