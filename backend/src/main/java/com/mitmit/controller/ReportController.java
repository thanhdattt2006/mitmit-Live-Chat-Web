package com.mitmit.controller;

import com.mitmit.entity.Report;
import com.mitmit.service.ReportService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping
    public ResponseEntity<Report> createReport(
            Authentication authentication,
            @RequestBody ReportRequest request) {
        String reporterId = (String) authentication.getPrincipal();
        Report report = reportService.createReport(
                reporterId,
                request.getReportedId(),
                request.getReason(),
                request.getDetails()
        );
        return ResponseEntity.ok(report);
    }

    @Data
    public static class ReportRequest {
        private String reportedId;
        private String reason;
        private String details;
    }
}
