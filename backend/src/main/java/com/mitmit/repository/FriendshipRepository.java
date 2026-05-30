package com.mitmit.repository;

import com.mitmit.entity.Friendship;
import com.mitmit.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, Long> {
    Optional<Friendship> findByUser1AndUser2(User user1, User user2);

    List<Friendship> findByUser1OrUser2(User user1, User user2);

    boolean existsByUser1AndUser2(User user1, User user2);

    default boolean existsByUserIdAndFriendId(User user1, User user2) {
        return existsByUser1AndUser2(user1, user2) || existsByUser1AndUser2(user2, user1);
    }
}
