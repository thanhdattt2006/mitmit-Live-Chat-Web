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

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public Report createReport(String reporterId, String reportedId, String reason, String details) {
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
            }
        }
    }

    @Transactional
    public void ignoreReport(Long reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        report.setStatus(ReportStatus.DISMISSED);
        reportRepository.save(report);
    }
}
