package com.mitmit.event;

import org.springframework.context.ApplicationEvent;
import lombok.Getter;

@Getter
public class ReportCreatedEvent extends ApplicationEvent {
    private final String reportedId;

    public ReportCreatedEvent(Object source, String reportedId) {
        super(source);
        this.reportedId = reportedId;
    }
}
