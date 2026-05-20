package com.mitmit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WebRTCSignal {
    private String targetUserId;
    private String senderId;
    private String type; // offer, answer, ice
    private Object data; // SDP or ICE payload
}
