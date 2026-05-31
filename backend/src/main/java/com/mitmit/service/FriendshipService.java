package com.mitmit.service;

import com.mitmit.entity.Friendship;
import com.mitmit.entity.FriendshipStatus;
import com.mitmit.entity.User;
import com.mitmit.repository.FriendshipRepository;
import com.mitmit.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FriendshipService {

    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;

    public List<Friendship> getUserInbox(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return friendshipRepository.findByUser1(user);
    }

    public void blockUser(Long friendshipId, String requesterId) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new RuntimeException("Friendship not found"));

        if (!requesterId.equals(friendship.getUser1().getId()) && !requesterId.equals(friendship.getUser2().getId())) {
            throw new RuntimeException("Bạn không có quyền trong phòng chat này!");
        }

        friendship.setStatus(FriendshipStatus.BLOCKED);
        friendshipRepository.save(friendship);
    }

    @org.springframework.transaction.annotation.Transactional
    public void unfriend(String userId, String friendId) {
        User user1 = userRepository.findById(userId).orElse(null);
        User user2 = userRepository.findById(friendId).orElse(null);
        if (user1 != null && user2 != null) {
            friendshipRepository.findByUser1AndUser2(user1, user2).ifPresent(friendshipRepository::delete);
            friendshipRepository.findByUser1AndUser2(user2, user1).ifPresent(friendshipRepository::delete);
        }
    }
}
