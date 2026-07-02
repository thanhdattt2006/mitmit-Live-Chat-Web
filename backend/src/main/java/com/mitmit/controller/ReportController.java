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
            @jakarta.validation.Valid @RequestBody ReportRequest request) {
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

    @PostMapping("/reports/nsfw")
    public ResponseEntity<Void> reportNsfw(
            Authentication authentication,
            @jakarta.validation.Valid @RequestBody ReportRequest request,
            jakarta.servlet.http.HttpServletRequest httpRequest) {
        String ipAddress = httpRequest.getRemoteAddr();
        reportService.banUserNsfw(request.getReportedId(), ipAddress);
        return ResponseEntity.ok().build();
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

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/unban/{userId}")
    public ResponseEntity<Void> unbanUser(@PathVariable String userId) {
        reportService.unbanUser(userId);
        return ResponseEntity.ok().build();
    }

    @Data
    public static class ReportRequest {
        @jakarta.validation.constraints.NotBlank(message = "ID người bị tố cáo không được để trống")
        private String reportedId;
        
        @jakarta.validation.constraints.NotBlank(message = "Lý do không được để trống")
        @jakarta.validation.constraints.Size(max = 255, message = "Lý do quá dài")
        private String reason;
        
        @jakarta.validation.constraints.Size(max = 1000, message = "Chi tiết không vượt quá 1000 ký tự")
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
