package com.mitmit.repository;

import com.mitmit.document.ChatSession;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatSessionRepository extends MongoRepository<ChatSession, String> {
    List<ChatSession> findByUser1IdOrUser2IdOrderByStartedAtDesc(String user1Id, String user2Id);
}
