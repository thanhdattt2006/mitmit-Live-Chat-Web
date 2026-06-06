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
        Friendship f = friendshipRepository.findById(friendshipId).orElse(null);
        if (f != null) {
            Friendship partnerF = friendshipRepository.findByUser1AndUser2(f.getUser2(), f.getUser1()).orElse(null);
            if (partnerF != null) {
                return chatMessageRepository.findByFriendshipIdInOrderByCreatedAtAsc(java.util.List.of(f.getId(), partnerF.getId()));
            }
        }
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
            
            messagingTemplate.convertAndSend("/queue/chat-" + senderId, savedMessage);

            Friendship partnerF = friendshipRepository.findByUser1AndUser2(friendship.getUser2(), friendship.getUser1()).orElse(null);
            if (partnerF != null) {
                ChatMessage messageForReceiver = ChatMessage.builder()
                        .id(savedMessage.getId())
                        .friendshipId(partnerF.getId())
                        .senderId(savedMessage.getSenderId())
                        .type(savedMessage.getType())
                        .content(savedMessage.getContent())
                        .replyToId(savedMessage.getReplyToId())
                        .reaction(savedMessage.getReaction())
                        .isUnsent(savedMessage.getIsUnsent())
                        .createdAt(savedMessage.getCreatedAt())
                        .build();
                messagingTemplate.convertAndSend("/queue/chat-" + receiverId, messageForReceiver);
            } else {
                messagingTemplate.convertAndSend("/queue/chat-" + receiverId, savedMessage);
            }
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
            String senderId = friendship.getUser1().getId();
            String receiverId = friendship.getUser2().getId();
            messagingTemplate.convertAndSend("/queue/chat-" + senderId, saved);

            Friendship partnerF = friendshipRepository.findByUser1AndUser2(friendship.getUser2(), friendship.getUser1()).orElse(null);
            if (partnerF != null) {
                ChatMessage msgForReceiver = ChatMessage.builder()
                        .id(saved.getId())
                        .friendshipId(partnerF.getId())
                        .senderId(saved.getSenderId())
                        .type(saved.getType())
                        .content(saved.getContent())
                        .replyToId(saved.getReplyToId())
                        .reaction(saved.getReaction())
                        .isUnsent(saved.getIsUnsent())
                        .createdAt(saved.getCreatedAt())
                        .build();
                messagingTemplate.convertAndSend("/queue/chat-" + receiverId, msgForReceiver);
            } else {
                messagingTemplate.convertAndSend("/queue/chat-" + receiverId, saved);
            }
        }
        return saved;
    }
}
