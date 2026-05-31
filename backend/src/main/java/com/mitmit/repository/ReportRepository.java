package com.mitmit.repository;

import com.mitmit.entity.Report;
import com.mitmit.entity.ReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import java.time.LocalDateTime;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    Page<Report> findByStatus(ReportStatus status, Pageable pageable);
    long countByReportedIdAndCreatedAtAfter(String reportedId, LocalDateTime cutoff);
}
