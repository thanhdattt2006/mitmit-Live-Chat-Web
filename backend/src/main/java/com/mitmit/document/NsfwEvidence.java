package com.mitmit.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "nsfw_evidences")
public class NsfwEvidence {
    @Id
    private String id;
    private String reportedId;
    private String evidenceData; // Base64 chuỗi ảnh chụp
    private LocalDateTime createdAt;
}
