package com.mitmit.service;

import com.mitmit.document.ChatSession;
import com.mitmit.entity.User;
import com.mitmit.repository.ChatSessionRepository;
import com.mitmit.repository.FriendshipRepository;
import com.mitmit.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Optional;
import java.util.concurrent.Executor;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MatchmakingServiceTest {

    @Mock private RedisService redisService;
    @Mock private ChatSessionRepository chatSessionRepository;
    @Mock private SimpMessagingTemplate messagingTemplate;
    @Mock private UserRepository userRepository;
    @Mock private FriendshipRepository friendshipRepository;
    @Mock private Executor matchmakingExecutor;

    @InjectMocks
    private MatchmakingService matchmakingService;

    @BeforeEach
    void setUp() {
    }

    @Test
    void testProcessMatchmakingQueue_NotEnoughUsers() {
        when(redisService.getQueueSize(anyString())).thenReturn(1L);

        matchmakingService.processMatchmakingQueue();

        verify(redisService, never()).popFromQueue(anyString());
    }

    @Test
    void testProcessMatchmakingQueue_EnoughUsers_ShouldMatchSuccess() {
        // Mock specific queue sizes for each mode to only test "video" logic flow
        when(redisService.getQueueSize("queue:video")).thenReturn(2L);
        when(redisService.getQueueSize("queue:voice")).thenReturn(0L);
        when(redisService.getQueueSize("queue:text")).thenReturn(0L);

        when(redisService.popFromQueue("queue:video")).thenReturn("user1", "user2", null);

        when(userRepository.findById("user1")).thenReturn(Optional.of(new User()));
        when(userRepository.findById("user2")).thenReturn(Optional.of(new User()));
        when(friendshipRepository.existsByUserIdAndFriendId(any(), any())).thenReturn(false);

        when(redisService.isMemberOfSet("blacklist:user1", "user2")).thenReturn(false);

        doAnswer(invocation -> {
            Runnable runnable = invocation.getArgument(0);
            runnable.run();
            return null;
        }).when(matchmakingExecutor).execute(any(Runnable.class));

        matchmakingService.processMatchmakingQueue();

        verify(messagingTemplate, times(1)).convertAndSend(eq("/topic/match/user1"), any(Object.class));
        verify(messagingTemplate, times(1)).convertAndSend(eq("/topic/match/user2"), any(Object.class));

        verify(chatSessionRepository, times(1)).save(any(ChatSession.class));
    }
}
