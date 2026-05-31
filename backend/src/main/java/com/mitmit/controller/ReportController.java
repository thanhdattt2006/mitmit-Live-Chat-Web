package com.mitmit.controller;

import com.mitmit.entity.Report;
import com.mitmit.service.ReportService;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping("/reports")
    public ResponseEntity<Report> createReport(
            Authentication authentication,
            @RequestBody ReportRequest request) {
        String reporterId = (String) authentication.getPrincipal();
        Report report = reportService.createReport(
                reporterId,
                request.getReportedId(),
                request.getReason(),
                request.getDetails(),
                request.getIsFromInbox()
        );
        return ResponseEntity.ok(report);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/reports")
    public ResponseEntity<Page<ReportResponse>> getReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<Report> reports = reportService.getPendingReports(PageRequest.of(page, size));
        Page<ReportResponse> response = reports.map(r -> ReportResponse.builder()
                .id(r.getId())
                .reportedId(r.getReported().getId())
                .reportedUser(r.getReported().getAnonymousName() != null ? r.getReported().getAnonymousName() : r.getReported().getEmail())
                .avatarUrl(r.getReported().getAvatarUrl())
                .reporter(r.getReporter().getAnonymousName() != null ? r.getReporter().getAnonymousName() : r.getReporter().getEmail())
                .reason(r.getReason())
                .build());
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/reports/{reportId}/ignore")
    public ResponseEntity<Void> ignoreReport(@PathVariable Long reportId) {
        reportService.ignoreReport(reportId);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/ban/{userId}")
    public ResponseEntity<Void> banUser(
            @PathVariable String userId,
            @RequestParam(required = false) Long reportId) {
        reportService.banUser(userId, reportId);
        return ResponseEntity.ok().build();
    }

    @Data
    public static class ReportRequest {
        private String reportedId;
        private String reason;
        private String details;
        private Boolean isFromInbox;
    }

    @Data
    @Builder
    public static class ReportResponse {
        private Long id;
        private String reportedId;
        private String reportedUser;
        private String avatarUrl;
        private String reporter;
        private String reason;
    }
}
