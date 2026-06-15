package com.mitmit.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:mitmit.noreply@gmail.com}")
    private String fromEmail;

    @Async
    public void sendBanNotification(String toEmail, String reason) {
        if (toEmail == null || toEmail.isEmpty()) {
            log.warn("Cannot send ban notification. Email is empty.");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Tài khoản mitmit của bạn đã bị khóa vĩnh viễn");
            
            String text = "Chào bạn,\n\n" +
                          "Tài khoản của bạn trên mitmit đã bị khóa vĩnh viễn do vi phạm điều khoản và tiêu chuẩn cộng đồng.\n" +
                          "Lý do: " + (reason != null && !reason.isEmpty() ? reason : "Vi phạm quy định hệ thống") + "\n\n" +
                          "Lưu ý: Mọi khiếu nại vui lòng liên hệ Ban quản trị để được giải quyết.\n\n" +
                          "Trân trọng,\nMitmit Team";
            
            message.setText(text);
            mailSender.send(message);
            log.info("Sent ban notification email to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send ban notification email to {}", toEmail, e);
        }
    }
}
