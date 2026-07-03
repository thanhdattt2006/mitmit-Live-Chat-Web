package com.mitmit.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class NsfwReportRequest {
    @NotBlank(message = "ID người bị tố cáo không được để trống")
    private String reportedId;

    @NotBlank(message = "Ảnh bằng chứng không được để trống")
    private String evidenceImage;
}
