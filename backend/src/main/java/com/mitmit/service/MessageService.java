package com.mitmit.service;

import com.mitmit.document.ChatMessage;
import com.mitmit.repository.ChatMessageRepository;
import com.mitmit.repository.FriendshipRepository;
import com.mitmit.entity.Friendship;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final FriendshipRepository friendshipRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public List<ChatMessage> getMessages(Long friendshipId) {
        return chatMessageRepository.findByFriendshipIdOrderByCreatedAtAsc(friendshipId);
    }

    @Transactional
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
        ChatMessage savedMessage = chatMessageRepository.save(message);

        // Broadcast to receiver via STOMP
        Friendship friendship = friendshipRepository.findById(messageRequest.getFriendshipId()).orElse(null);
        if (friendship != null) {
            String receiverId = friendship.getUser1().getId().equals(senderId) 
                    ? friendship.getUser2().getId() 
                    : friendship.getUser1().getId();
            
            messagingTemplate.convertAndSend("/queue/chat-" + receiverId, savedMessage);
            messagingTemplate.convertAndSend("/queue/chat-" + senderId, savedMessage);
        }

        return savedMessage;
    }

    public void unsendMessage(String id) {
        chatMessageRepository.deleteById(id);
    }

    @Transactional
    public ChatMessage reactToMessage(String id, String reaction) {
        ChatMessage msg = chatMessageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        msg.setReaction(reaction);
        ChatMessage saved = chatMessageRepository.save(msg);
        
        // Broadcast reaction update
        Friendship friendship = friendshipRepository.findById(msg.getFriendshipId()).orElse(null);
        if (friendship != null) {
            messagingTemplate.convertAndSend("/queue/chat-" + friendship.getUser1().getId(), saved);
            messagingTemplate.convertAndSend("/queue/chat-" + friendship.getUser2().getId(), saved);
        }
        return saved;
    }
}
