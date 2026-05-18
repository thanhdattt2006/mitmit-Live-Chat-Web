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
        return friendshipRepository.findByUser1OrUser2(user, user);
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
}
