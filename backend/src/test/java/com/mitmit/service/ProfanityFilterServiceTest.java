package com.mitmit.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import com.mitmit.repository.UserRepository;

import static org.junit.jupiter.api.Assertions.*;

class ProfanityFilterServiceTest {

    @Mock private RedisTemplate<String, Object> redisTemplate;
    @Mock private UserRepository userRepository;
    @Mock private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private ProfanityFilterService profanityFilterService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @ParameterizedTest
    @ValueSource(strings = {"đm", "vcl", "ĐịT mẹ", "CặC", "lồn", "thằng chó đẻ", "vkl nha"})
    void testContainsProfanityOrLink_ShouldReturnTrue_WhenTextContainsBadWords(String badText) {
        assertTrue(profanityFilterService.containsProfanityOrLink(badText), "System must block: " + badText);
    }

    @ParameterizedTest
    @ValueSource(strings = {"Chào buổi sáng", "Uống lon coca", "con cuốc", "Hôm nay trời đẹp", "Lộn xộn quá"})
    void testContainsProfanityOrLink_ShouldReturnFalse_WhenTextIsCleanOrBorderline(String cleanText) {
        assertFalse(profanityFilterService.containsProfanityOrLink(cleanText), "System false positive: " + cleanText);
    }

    @ParameterizedTest
    @ValueSource(strings = {"http://google.com", "Vào link này nha https://phishing.com", "ftp://test.com"})
    void testContainsProfanityOrLink_ShouldReturnTrue_WhenTextContainsLink(String textWithLink) {
        assertTrue(profanityFilterService.containsProfanityOrLink(textWithLink), "System must block link: " + textWithLink);
    }
}
