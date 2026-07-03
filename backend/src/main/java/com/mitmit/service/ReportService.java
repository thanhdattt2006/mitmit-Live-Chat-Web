package com.mitmit.service;

import com.mitmit.entity.Report;
import com.mitmit.entity.ReportStatus;
import com.mitmit.entity.User;
import com.mitmit.entity.UserStatus;
import com.mitmit.repository.ReportRepository;
import com.mitmit.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import com.mitmit.repository.ChatSessionRepository;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final FriendshipService friendshipService;
    private final RedisService redisService;
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatSessionRepository chatSessionRepository;
    private final EmailService emailService;
    private final com.mitmit.repository.NsfwEvidenceRepository nsfwEvidenceRepository;

    @Transactional
    public Report createReport(String reporterId, String reportedId, String reason, String details, Boolean isFromInbox) {
        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new RuntimeException("Reporter not found"));
        User reported = userRepository.findById(reportedId)
                .orElseThrow(() -> new RuntimeException("Reported user not found"));

        Report report = Report.builder()
                .reporter(reporter)
                .reported(reported)
                .reason(reason)
                .description(details)
                .status(ReportStatus.PENDING)
                .build();

        report = reportRepository.save(report);
        
        if (Boolean.TRUE.equals(isFromInbox)) {
            friendshipService.unfriend(reporterId, reportedId);
            // Block (Blacklist for 10 years ~ 5256000 minutes)
            redisService.addToSetWithExpire("blacklist:" + reporterId, reportedId, 5256000);
            redisService.addToSetWithExpire("blacklist:" + reportedId, reporterId, 5256000);
        }
        
        // Fire async event to handle auto-banning logic without blocking HTTP thread
        eventPublisher.publishEvent(new com.mitmit.event.ReportCreatedEvent(this, reportedId));

        return report;
    }

    public Page<Report> getPendingReports(Pageable pageable) {
        return reportRepository.findByStatus(ReportStatus.PENDING, pageable);
    }

    @Transactional
    public void banUser(String reportedId, Long reportId) {
        User reported = userRepository.findById(reportedId)
                .orElseThrow(() -> new RuntimeException("Reported user not found"));
        reported.setStatus(UserStatus.BANNED);
        userRepository.save(reported);

        if (reportId != null) {
            Report report = reportRepository.findById(reportId).orElse(null);
            if (report != null) {
                report.setStatus(ReportStatus.RESOLVED);
                reportRepository.save(report);
                emailService.sendBanNotification(reported.getEmail(), "Admin đã xử lý Report - Lỗi: " + report.getReason());
            } else {
                emailService.sendBanNotification(reported.getEmail(), "Vi phạm tiêu chuẩn cộng đồng");
            }
        } else {
            emailService.sendBanNotification(reported.getEmail(), "Vi phạm tiêu chuẩn cộng đồng");
        }
    }

    @Transactional
    public void ignoreReport(Long reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        report.setStatus(ReportStatus.DISMISSED);
        reportRepository.save(report);
    }

    @Transactional
    public void banUserNsfw(String reportedId, String evidenceImage, String ipAddress) {
        // Lưu bằng chứng xuống MongoDB
        com.mitmit.document.NsfwEvidence evidence = com.mitmit.document.NsfwEvidence.builder()
                .reportedId(reportedId)
                .evidenceData(evidenceImage)
                .createdAt(java.time.LocalDateTime.now())
                .build();
        nsfwEvidenceRepository.save(evidence);

        User reported = userRepository.findById(reportedId)
                .orElseThrow(() -> new RuntimeException("Reported user not found"));
        reported.setStatus(UserStatus.BANNED);
        userRepository.save(reported);

        // Tạo Report trong MySQL để lưu dấu vết (Hệ thống tự động cảnh báo)
        Report systemReport = Report.builder()
                .reporter(null) // null có nghĩa là System
                .reported(reported)
                .reason("NSFW")
                .description("Hệ thống AI tự động phát hiện hành vi trình chiếu nội dung nhạy cảm, đồi trụy (NSFW). ID bằng chứng MongoDB: " + evidence.getId())
                .status(ReportStatus.RESOLVED)
                .build();
        reportRepository.save(systemReport);

        if (ipAddress != null && !ipAddress.isEmpty()) {
            redisService.addToSetWithExpire("blacklist:ip", ipAddress, 5256000);
        }

        java.util.List<com.mitmit.document.ChatSession> sessions = chatSessionRepository.findByUser1IdOrUser2IdOrderByStartedAtDesc(reportedId, reportedId);
        if (!sessions.isEmpty()) {
            com.mitmit.document.ChatSession lastSession = sessions.get(0);
            messagingTemplate.convertAndSend("/topic/room/" + lastSession.getId() + "/force_close", "NSFW_BANNED");
        }

        emailService.sendBanNotification(reported.getEmail(), "Hệ thống AI phát hiện hành vi trình chiếu nội dung nhạy cảm, đồi trụy (NSFW).");
    }

    @Transactional
    public void unbanUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
        
        emailService.sendBanNotification(user.getEmail(), "Tài khoản của bạn đã được ân xá (Un-banned) sau quá trình khiếu nại thành công. Chào mừng trở lại mitmit!");
    }
}
