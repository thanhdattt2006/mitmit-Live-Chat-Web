package com.mitmit.service;

import com.mitmit.document.ChatMessage;
import com.mitmit.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final ChatMessageRepository chatMessageRepository;

    public List<ChatMessage> getMessages(Long friendshipId) {
        return chatMessageRepository.findByFriendshipIdOrderByCreatedAtAsc(friendshipId);
    }

    public ChatMessage sendMessage(String senderId, ChatMessage messageRequest) {
        ChatMessage message = ChatMessage.builder()
                .friendshipId(messageRequest.getFriendshipId())
                .senderId(senderId)
                .type(messageRequest.getType() != null ? messageRequest.getType() : "TEXT")
                .content(messageRequest.getContent())
                .replyToId(messageRequest.getReplyToId())
                .reaction(messageRequest.getReaction())
                .isUnsent(false)
                .createdAt(LocalDateTime.now())
                .build();
        return chatMessageRepository.save(message);
    }

    public void unsendMessage(String id) {
        chatMessageRepository.deleteById(id);
    }
}
