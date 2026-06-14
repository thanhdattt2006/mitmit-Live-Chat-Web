package com.mitmit.listener;

import com.mitmit.entity.User;
import com.mitmit.entity.UserStatus;
import com.mitmit.event.ReportCreatedEvent;
import com.mitmit.repository.ReportRepository;
import com.mitmit.repository.UserRepository;
import com.mitmit.repository.ChatSessionRepository;
import com.mitmit.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReportEventListener {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final ChatSessionRepository chatSessionRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final EmailService emailService;

    @Async
    @EventListener
    public void handleReportCreated(ReportCreatedEvent event) {
        String reportedId = event.getReportedId();
        
        try {
            long recentReports = reportRepository.countByReportedIdAndCreatedAtAfter(
                    reportedId, 
                    LocalDateTime.now().minusHours(1)
            );

            if (recentReports >= 3) {
                User reported = userRepository.findById(reportedId).orElse(null);
                if (reported != null && reported.getStatus() != UserStatus.BANNED) {
                    reported.setStatus(UserStatus.BANNED);
                    userRepository.save(reported);
                    log.info("Auto-banned user {} due to multiple reports.", reportedId);

                    // Force close active session if exists
                    java.util.List<com.mitmit.document.ChatSession> sessions = chatSessionRepository.findByUser1IdOrUser2IdOrderByStartedAtDesc(reportedId, reportedId);
                    if (!sessions.isEmpty()) {
                        com.mitmit.document.ChatSession lastSession = sessions.get(0);
                        messagingTemplate.convertAndSend("/topic/room/" + lastSession.getId() + "/force_close", "BANNED");
                    }
                    
                    emailService.sendBanNotification(reported.getEmail(), "Tài khoản bị nhiều người dùng báo cáo (Report) trong thời gian ngắn.");
                }
            }
        } catch (Exception e) {
            log.error("Error processing ReportCreatedEvent for reportedId {}", reportedId, e);
        }
    }
}
