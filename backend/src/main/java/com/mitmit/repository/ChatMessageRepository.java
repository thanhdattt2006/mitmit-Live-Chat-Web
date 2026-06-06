package com.mitmit.repository;

import com.mitmit.document.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {
    List<ChatMessage> findByFriendshipIdOrderByCreatedAtAsc(Long friendshipId);
    List<ChatMessage> findByFriendshipIdInOrderByCreatedAtAsc(List<Long> friendshipIds);
}
