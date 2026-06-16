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

    public org.springframework.data.domain.Page<ChatMessage> getMessages(Long friendshipId, int page, int size) {
        org.springframework.data.domain.PageRequest pageRequest = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
        Friendship f = friendshipRepository.findById(friendshipId).orElse(null);
        if (f != null) {
            Friendship partnerF = friendshipRepository.findByUser1AndUser2(f.getUser2(), f.getUser1()).orElse(null);
            if (partnerF != null) {
                return chatMessageRepository.findByFriendshipIdInOrderByCreatedAtDesc(java.util.List.of(f.getId(), partnerF.getId()), pageRequest);
            }
        }
        return chatMessageRepository.findByFriendshipIdOrderByCreatedAtDesc(friendshipId, pageRequest);
    }

    @Transactional
    public ChatMessage sendMessage(String senderId, ChatMessage messageRequest) {
        ChatMessage message = ChatMessage.builder()
                .friendshipId(messageRequest.getFriendshipId())
                .senderId(senderId)
                .type(messageRequest.getType() != null ? messageRequest.getType() : "TEXT")
                .content(messageRequest.getContent())
                .replyToId(messageRequest.getReplyToId())
                .reactions(messageRequest.getReactions())
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
                        .reactions(savedMessage.getReactions())
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
    public ChatMessage reactToMessage(String id, String reaction, String userId) {
        ChatMessage msg = chatMessageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        
        if (msg.getReactions() == null) {
            msg.setReactions(new java.util.HashMap<>());
        }
        msg.getReactions().put(userId, reaction);
        
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
                        .reactions(saved.getReactions())
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
