package com.example.backend.document;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "chat_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatSession {
    @Id
    private String id;

    private String user1Id;
    private String user2Id;
    private String callType; // VIDEO, VOICE, TEXT

    private Date startedAt;
    private Date endedAt;
}
